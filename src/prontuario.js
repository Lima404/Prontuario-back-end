const fastify = require('fastify')({ logger: true });
const fs = require('fs');

const prontuariosFilePath = './prontuarios.json';
const usersFilePath = './users.json';

// Função para ler o arquivo JSON
const readDataFromFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

// Função para salvar dados no arquivo JSON
const saveDataToFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Verifica se o CPF existe no sistema
const isCPFValid = (cpf) => {
  const users = readDataFromFile(usersFilePath);
  return users.some(user => user.cpf === cpf);
};

// CREATE - Adiciona um novo prontuário vinculado a um CPF de usuário existente
fastify.post('/prontuarios', (request, reply) => {
  const prontuarios = readDataFromFile(prontuariosFilePath);
  const { cpf, tipoSanguineo, alergias, possuirDoencaCronica, qualDoenca, usoContinuoMedicamento, qualMedicamento, historicoDoencas, historicoMedicamentos, exames } = request.body;

  if (!cpf || !isCPFValid(cpf)) {
    return reply.code(400).send({ message: 'CPF inválido ou não encontrado' });
  }

  const newProntuario = {
    id: prontuarios.length ? prontuarios[prontuarios.length - 1].id + 1 : 1,
    cpf,
    tipoSanguineo,
    alergias,
    possuirDoencaCronica,
    qualDoenca,
    usoContinuoMedicamento,
    qualMedicamento,
    historicoDoencas,
    historicoMedicamentos,
    exames
  };

  prontuarios.push(newProntuario);
  saveDataToFile(prontuariosFilePath, prontuarios);

  reply.code(201).send(newProntuario);
});

// READ - Obtém todos os prontuários
fastify.get('/prontuarios', (request, reply) => {
  const prontuarios = readDataFromFile(prontuariosFilePath);
  reply.send(prontuarios);
});

// READ - Obtém um prontuário por ID
fastify.get('/prontuarios/:id', (request, reply) => {
  const prontuarios = readDataFromFile(prontuariosFilePath);
  const prontuario = prontuarios.find((p) => p.id === parseInt(request.params.id));

  if (prontuario) {
    reply.send(prontuario);
  } else {
    reply.code(404).send({ message: 'Prontuário não encontrado' });
  }
});

// UPDATE - Atualiza um prontuário por ID
fastify.put('/prontuarios/:id', (request, reply) => {
  const prontuarios = readDataFromFile(prontuariosFilePath);
  const index = prontuarios.findIndex((p) => p.id === parseInt(request.params.id));

  if (index !== -1) {
    const { tipoSanguineo, alergias, possuirDoencaCronica, qualDoenca, usoContinuoMedicamento, qualMedicamento, historicoDoencas, historicoMedicamentos, exames } = request.body;

    prontuarios[index] = {
      ...prontuarios[index],
      tipoSanguineo: tipoSanguineo || prontuarios[index].tipoSanguineo,
      alergias: alergias || prontuarios[index].alergias,
      possuirDoencaCronica: possuirDoencaCronica !== undefined ? possuirDoencaCronica : prontuarios[index].possuirDoencaCronica,
      qualDoenca: qualDoenca || prontuarios[index].qualDoenca,
      usoContinuoMedicamento: usoContinuoMedicamento !== undefined ? usoContinuoMedicamento : prontuarios[index].usoContinuoMedicamento,
      qualMedicamento: qualMedicamento || prontuarios[index].qualMedicamento,
      historicoDoencas: historicoDoencas || prontuarios[index].historicoDoencas,
      historicoMedicamentos: historicoMedicamentos || prontuarios[index].historicoMedicamentos,
      exames: exames || prontuarios[index].exames
    };

    saveDataToFile(prontuariosFilePath, prontuarios);
    reply.send(prontuarios[index]);
  } else {
    reply.code(404).send({ message: 'Prontuário não encontrado' });
  }
});

// DELETE - Remove um prontuário por ID
fastify.delete('/prontuarios/:id', (request, reply) => {
  let prontuarios = readDataFromFile(prontuariosFilePath);
  const index = prontuarios.findIndex((p) => p.id === parseInt(request.params.id));

  if (index !== -1) {
    const deletedProntuario = prontuarios.splice(index, 1);
    saveDataToFile(prontuariosFilePath, prontuarios);
    reply.send(deletedProntuario);
  } else {
    reply.code(404).send({ message: 'Prontuário não encontrado' });
  }
});

// Inicia o servidor
fastify.listen({ port: 3001 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server running at ${address}`);
});
