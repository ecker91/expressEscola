import express from "express";

const app = express();

let alunos= [
    {nome:"Dummy", matricula:"A123", status:"ativo", notas: [7,7,7,7] },
    {nome:'Admin', matricula:"Z987", status:"inativo", notas: [10,10,10,10]}
  ];

app.use(express.json());

app.post("/alunos", (req, res) => {
    const {nome, matricula, status} = req.body
    if(nome && matricula){
        if(status === "ativo" || status =="inativo"){
            let buscaMatricula = alunos.find(aluno => aluno.matricula == matricula)
            if(!buscaMatricula){
                alunos.push({
                    nome,
                    matricula,
                    status
                })
                res.json({
                    mensagem: "Aluno cadastrado com sucesso!",
                    body: { nome, matricula, status }
                  })
            }else{
                res.json({
                    mensagem: 'Matricula já cadastrada!'
                })
            }
        }else{
            res.json({
                mensagem: 'Campo "status" deve ser preenchido "ativo" ou "inativo"'
            })
        }
    }else{
        res.json({
            mensagem: 'Matrícula ou nome não preenchidos'
        })
    }
});

app.post("/alunos/:matricula/notas", (req, res) => {
    const params = req.params.matricula
    
    const {notas} = req.body
    if(notas.length == 4){
        let alunoBuscaMatricula = alunos.filter(aluno => aluno.matricula == params)
        if(alunoBuscaMatricula[0]){
            alunos = alunos.filter(aluno => aluno.matricula != params);
            alunoBuscaMatricula[0].notas = notas            
            alunos.push(alunoBuscaMatricula[0])
            res.json({
                mensagem: 'Notas cadastradas!'
            })
        }else{
            res.json({
                mensagem: 'Matrícula não cadastrada!'
            })
        }
    }else{
        res.json({
            mensagem: 'Inclua quatro notas!'
        })
    }
});

app.delete('/alunos/:matricula', (req, res) => {
    const {matricula} = req.params
    alunos = alunos.filter(aluno => aluno.matricula != matricula)
    res.json({
        mensagem: 'Aluno deletado com sucesso!'
    })
})

app.get('/alunos', (req, res) => {
    const alunosAtivos = alunos.filter(aluno => aluno.status == "ativo")
    const listaAlunos = alunosAtivos.map(aluno => {
        return {
            nome: aluno.nome,
            matricula: aluno.matricula
        }
    })
    res.json(listaAlunos)
})

app.get('/alunos/notas', (req, res) => {
    const alunosComNotas = alunos.filter(aluno => aluno.notas)
    const listaAlunos = alunosComNotas.map(aluno =>{
        if(aluno.notas){

            const media = aluno.notas[0]/4+aluno.notas[1]/4+aluno.notas[2]/4+aluno.notas[3]/4
            return {
                nome: aluno.nome,
                notas: aluno.notas,
                media
            }
        }
    })
    res.json(listaAlunos)
})

app.get('/alunos/:matricula', (req, res) => {
    const params = req.params.matricula
    const alunoBuscaMatricula = alunos.filter(aluno => aluno.matricula == params)
    const aluno = alunoBuscaMatricula[0]
    aluno.media = "N/A"
    if(aluno.notas){
        const media = aluno.notas[0]/4+aluno.notas[1]/4+aluno.notas[2]/4+aluno.notas[3]/4
        aluno.media = media
    }
    res.json({
            nome: aluno.nome,
            matricula: aluno.matricula,
            status: aluno.status,
            media: aluno.media
        })
})


app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
