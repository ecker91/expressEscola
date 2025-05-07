import express from "express";

const app = express();

let dateDummy = new Date

const alunos = [
  { nome: "Dummy", 
    matricula: "A123", 
    status: "ativo", 
    notas: [7, 7, 7, 7],
    dataCriacao: dateDummy.toISOString() 
  },
  {
    nome: "Admin",
    matricula: "Z987",
    status: "ativo",
    notas: [10,10,10,10],
    dataCriacao: dateDummy.toISOString() 
  },
];

app.use(express.json());

app.post("/alunos", (req, res) => {
  let { nome, matricula, status } = req.body;
  matricula = matricula.toUpperCase()

  if (!nome) {
    return res.status(400).json({
      erro: "O campo 'nome' é obrigatório."
    })
  }
  
  if (!matricula) {
    return res.status(400).json({
      erro: "O campo 'matricula' é obrigatório."
    })
  }
  
  if (!status) {
    return res.status(400).json({
      erro: "O campo 'status' é obrigatório."
    })
  }

  if (nome.length < 3) {
    return res.status(400).json({
      erro: "O nome deve conter pelo menos 3 caracteres."
    })
  }

  if (status === "ativo" || status == "inativo") {
    let buscaMatricula = alunos.find((aluno) => aluno.matricula == matricula);
    if (!buscaMatricula) {
      let date = new Date
      alunos.push({
        nome,
        matricula,
        status,
        dataCriacao: date.toISOString(),
      });
      return res.status(201).json({
        mensagem: "Aluno cadastrado com sucesso."
      });
    } else {
      return res.status(409).json({ 
        erro: "Já existe um aluno com essa matrícula."
        });
    }
  } else {
    return res.status(400).json({
      erro:
        "O campo 'status' deve ser 'ativo' ou 'inativo'.",
    });
  }
});

app.post("/alunos/:matricula/notas", (req, res) => {
  const params = req.params.matricula.toUpperCase();
  const { notas } = req.body;

  if (!notas) {
    return res.status(400).json({
      erro: "O campo 'notas' é obrigatório e deve ser um array de 4 números.",
    })
  }

  for (let i = 0; i < notas.length; i++){
    if(notas[i] > 10 || notas[i] < 0){
      return res.status(400).json({
        erro: "As notas devem estar entre 0 e 10."
      })
    }
  }

  if (notas.length == 4) {
    const alunoBuscaMatricula = alunos.find(
      (aluno) => aluno.matricula == params
    );
    if (alunoBuscaMatricula) {
      if (alunoBuscaMatricula.status == "inativo") {
        return res.status(403).json({
          erro: "Não é possível cadastrar notas para alunos inativos.",
        })
      }
      let date = new Date
      alunoBuscaMatricula.notas = notas;
      alunoBuscaMatricula.dataAlteracao = date.toISOString()
      return res.json({
        mensagem: "Notas cadastradas com sucesso.",
      });
    } else {
      return res.status(404).json({
        erro: "Aluno não encontrado.",
      });
    }
  } else {
    return res.status(400).json({
      erro: "Devem ser fornecidas exatamente 4 notas.",
    });
  }
});

app.delete("/alunos/:matricula", (req, res) => {
  let { matricula } = req.params;
  matricula = matricula.toUpperCase()
  
  const aluno = alunos.find((aluno) => aluno.matricula == matricula);
  if (aluno) {
    let date = new Date
    aluno.status = "inativo"
    aluno.dataDeletado = date.toISOString()
    return res.status(200).json({
      mensagem: "Aluno removido com sucesso.",
    });
  } else {
    return res.status(404).json({
      erro: "Aluno não encontrado.",
    });
  }
});

app.get("/alunos", (req, res) => {
  const param = req.query.status 

  if (param == 'ativo') {
  const alunosAtivos = alunos.filter((aluno) => aluno.status == "ativo");
  const listaAlunos = alunosAtivos.map((aluno) => {
    return {
      nome: aluno.nome,
      matricula: aluno.matricula,
      dataCriacao: aluno.dataCriacao,
    };
  });
  return res.status(200).json(listaAlunos);
  }

  if (param == 'inativo') {
    const alunosInativos = alunos.filter((aluno) => aluno.status == "inativo");
    const listaAlunos = alunosInativos.map((aluno) => {
      return {
        nome: aluno.nome,
        matricula: aluno.matricula,
        dataCriacao: aluno.dataCriacao,
      };
    });
    return res.status(200).json(listaAlunos);
    }

  
  const listaAlunos = alunos.map( aluno => {
    return {
      nome: aluno.nome,
      matricula: aluno.matricula,
      status: aluno.status,
      dataCriacao: aluno.dataCriacao,
    }
  })
  return res.status(200).json(listaAlunos)
  
});

app.get("/alunos/notas", (req, res) => {
  const alunosComNotasAtivos = alunos.filter((aluno) => aluno.notas && aluno.status == "ativo");
  const listaAlunos = alunosComNotasAtivos.map((aluno) => {
    if (aluno.notas) {
      let situacao
      const media =
        aluno.notas[0] / 4 +
        aluno.notas[1] / 4 +
        aluno.notas[2] / 4 +
        aluno.notas[3] / 4;

      if(media >= 7 ) {
        situacao = "aprovado"
      }

      if(media >= 5 && media < 7) {
        situacao = "recuperação"
      }

      if(media < 5) {
        situacao = "reprovado"
      }
      
      return {
        nome: aluno.nome,
        matricula: aluno.matricula,
        notas: aluno.notas,
        media,
        situacao,
      };
    }
  });
  return res.json(listaAlunos);
});

app.get("/alunos/:matricula", (req, res) => {
  const params = req.params.matricula.toUpperCase();
  const aluno = alunos.find((aluno) => aluno.matricula == params);

  if (!aluno) {
    return res.status(404).json({
      erro: "Aluno não encontrado.",
    })
  }
  if (aluno.notas) {
    let situacao
    const media =
      aluno.notas[0] / 4 +
      aluno.notas[1] / 4 +
      aluno.notas[2] / 4 +
      aluno.notas[3] / 4;

    if(media >= 7 ) {
      situacao = "aprovado"
    }

    if(media >= 5 && media < 7) {
      situacao = "recuperação"
    }

    if(media < 5) {
      situacao = "reprovado"
    }

    return res.status(200).json({...aluno, media, situacao});
  }
  
  return res.status(200).json(aluno)
  
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
