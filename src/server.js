const fastify = require('fastify')({ logger: true });
const fs = require('fs');

const dataFilePath = './users.json';

// Função para ler o arquivo JSON
const readDataFromFile = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Função para salvar dados no arquivo JSON
const saveDataToFile = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
};

// CREATE - Adiciona um novo usuário com endereço
fastify.post('/users', (request, reply) => {
  const users = readDataFromFile();
  const { nome, cpf, email, telefone, endereco } = request.body;

  // Validação simples para garantir que os campos obrigatórios estão presentes
  if (!nome || !cpf || !email || !telefone || !endereco) {
    return reply.code(400).send({ message: 'Todos os campos são obrigatórios' });
  }

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    nome,
    cpf,
    email,
    telefone,
    endereco: {
      nomeDaRua: endereco.nomeDaRua,
      bairro: endereco.bairro,
      numeroDaCasa: endereco.numeroDaCasa,
      cep: endereco.cep,
      estado: endereco.estado,
      pais: endereco.pais
    }
  };

  users.push(newUser);
  saveDataToFile(users);

  reply.code(201).send(newUser);
});

// READ - Obtém todos os usuários
fastify.get('/users', (request, reply) => {
  const users = readDataFromFile();
  reply.send(users);
});

// READ - Obtém um usuário por ID
fastify.get('/users/:id', (request, reply) => {
  const users = readDataFromFile();
  const user = users.find((u) => u.id === parseInt(request.params.id));

  if (user) {
    reply.send(user);
  } else {
    reply.code(404).send({ message: 'User not found' });
  }
});

// UPDATE - Atualiza um usuário por ID
fastify.put('/users/:id', (request, reply) => {
  const users = readDataFromFile();
  const index = users.findIndex((u) => u.id === parseInt(request.params.id));

  if (index !== -1) {
    const { nome, cpf, email, telefone, endereco } = request.body;

    users[index] = {
      ...users[index],
      nome: nome || users[index].nome,
      cpf: cpf || users[index].cpf,
      email: email || users[index].email,
      telefone: telefone || users[index].telefone,
      endereco: endereco ? {
        nomeDaRua: endereco.nomeDaRua || users[index].endereco.nomeDaRua,
        bairro: endereco.bairro || users[index].endereco.bairro,
        numeroDaCasa: endereco.numeroDaCasa || users[index].endereco.numeroDaCasa,
        cep: endereco.cep || users[index].endereco.cep,
        estado: endereco.estado || users[index].endereco.estado,
        pais: endereco.pais || users[index].endereco.pais
      } : users[index].endereco
    };

    saveDataToFile(users);
    reply.send(users[index]);
  } else {
    reply.code(404).send({ message: 'User not found' });
  }
});

// DELETE - Remove um usuário por ID
fastify.delete('/users/:id', (request, reply) => {
  let users = readDataFromFile();
  const index = users.findIndex((u) => u.id === parseInt(request.params.id));

  if (index !== -1) {
    const deletedUser = users.splice(index, 1);
    saveDataToFile(users);
    reply.send(deletedUser);
  } else {
    reply.code(404).send({ message: 'User not found' });
  }
});

// Inicia o servidor
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server running at ${address}`);
});
