const moment = require('moment')
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'sua_chave_secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  
}));

const connection =  mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'q12345q',
    database: 'Aproveitamento_de_estudos'
});

connection.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao MySQL!');
});



// Rota para obter todas as listas compartilhadas com o usuário atual
app.get('/listas/:username/compartilhadas', isAuthenticated, (req, res) => {
    const username = req.session.user;

    const sqlQuery = `
    SELECT l.*
    FROM lista_usuario AS lu
    LEFT JOIN lista AS l ON l.nome = lu.nome_lista AND l.nome_criador = lu.nome_criador_lista
    WHERE lu.nome_usuario = ? AND nome_criador != ? AND lu.validada = TRUE
`   ;

    connection.query(sqlQuery, [username,username], (err, results) => {
        if (err) {
            console.error('Erro ao recuperar listas do usuário:', err);
            res.status(500).json({ success: false, message: 'Erro ao recuperar listas do usuário' });
            return;
        }
        res.json(results);
    });
});



// Rota para obter todas as listas que o usuário atual criou
app.get('/listas/:username', isAuthenticated, (req, res) => {
    const username = req.session.user;

    const sqlQuery = `
    SELECT *
    FROM lista
    WHERE nome_criador = ?
`   ;
    connection.query(sqlQuery, [username], (err, results) => {
        if (err) {
            console.error('Erro ao recuperar listas do usuário:', err);
            res.status(500).json({ success: false, message: 'Erro ao recuperar listas do usuário' });
            return;
        }
        res.json(results);
    });
});

//Rota para deletar uma lista
app.delete('/listas/:nome_lista/:nome_criador_lista', (req, res) => {
    const { nome_lista, nome_criador_lista } = req.params;
    if(req.session.user != nome_criador_lista){
        console.log('Usuário autenticado:', req.session.user);
        console.log('Nome do criador da lista:', nome_criador_lista);
        console.log("não é o criador");
        return;
    }
    
    connection.query('DELETE FROM lista_usuario WHERE nome_lista = ? AND nome_criador_lista = ? AND validada = TRUE;', [nome_lista, nome_criador_lista], (err) => {
        if (err) {
            console.error('Erro ao excluir lista_usuario:', err);
            res.status(500).send('Erro ao excluir lista_usuario.');
            return;
        }

        
        connection.query('DELETE FROM tarefa WHERE nome_lista = ? AND nome_criador_lista = ?;', [nome_lista, nome_criador_lista], (err) => {
            if (err) {
                console.error('Erro ao excluir tarefa:', err);
                res.status(500).send('Erro ao excluir tarefa.');
                return;
            }

            
            connection.query('DELETE FROM lista WHERE nome = ? AND nome_criador = ?', [nome_lista, nome_criador_lista], (err) => {
                if (err) {
                    console.error('Erro ao excluir lista:', err);
                    res.status(500).send('Erro ao excluir lista.');
                    return;
                }

                
                res.status(204).send();
            });
        });
    });
});


// Rota para obter todas as tarefas de uma lista
app.get('/listas/:nome_lista/:nome_criador/tarefas', (req, res) => {
    const { nome_lista } = req.params;
    const { nome_criador } = req.params;
    connection.query('SELECT * FROM tarefa WHERE nome_lista = ? AND nome_criador_lista = ? ', [nome_lista,nome_criador], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

//Rota pra ver se a tarefa já existe
app.patch('/tarefas/:nome_tarefa/existe', (req, res) => {
    const { nome_tarefa } = req.params;
    const { criador, lista_nome } = req.body;

    connection.query(
        'SELECT COUNT(*) as count FROM tarefa WHERE nome_criador_lista = ? AND nome_lista = ?  AND titulo = ?',
        [criador, lista_nome, nome_tarefa],
        (err, results) => {
            if (err) throw err;
            const count = results[0].count;
            res.json({ exists: count > 0 });
        }
    );
});


//Rotas para convidar algém
app.post('/convites/:nome_convidado/:nome_lista/:nome_criador_lista',(req,res)=>{
    console.log("Ao menos entrei no servidor. ")
    const {nome_convidado,nome_lista,nome_criador_lista} = req.params;
    console.log("nome: ", nome_convidado,"lista :",nome_lista,"Criador:",nome_criador_lista)
    
    connection.query(
        `INSERT INTO lista_usuario VALUES (?,?,?,FALSE)`,
        [nome_convidado,nome_lista,nome_criador_lista],
        (err, results) => {
            if (err) throw err;
            res.json(results);
        }
    );
});


//Rota pra ver se o convidado já está cadastrado na lista
app.get('/convites/:nome_convidado/:nome_lista/:nome_criador_lista/existe', (req, res) => {
    console.log("Ao menos entrei no servidor. ")
    const {nome_convidado,nome_lista,nome_criador_lista} = req.params;
    console.log("nome: ", nome_convidado,"lista :",nome_lista,"Criador:",nome_criador_lista)
    
    connection.query(
        `SELECT COUNT(*) AS count FROM lista_usuario WHERE nome_usuario = ? AND nome_lista = ? AND nome_criador_Lista = ?`,
        [nome_convidado,nome_lista,nome_criador_lista],
        (err, results) => {
            if (err) throw err;
            const count = results[0].count;
            res.json({ exists: count > 0 });
        }
    );
});


//Rotapara as notificações
app.get('/notificacoes/:nome_usuario', (req, res) => {
    const nome_usuario = req.session.user;

    connection.query('SELECT COUNT(*) AS count FROM lista_usuario WHERE nome_usuario = ? AND validada = FALSE', [nome_usuario], (err, results) => {
        if (err) {
            console.error('Erro ao buscar convites:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar convites' });
        }

        const count = results[0].count;
        res.json({ count });
    });
});


//Rota pra ver se o convidado existe
app.get('/convites/:nome_convidado/existe', (req, res) => {
    const { nome_convidado } = req.params;
    const usuario = req.session.user;
    if(nome_convidado == usuario){
        console.log("Usuario: ",usuario)
        console.log("Convidado: ",nome_convidado)
        res.json({ exists: false });
    }else{
    connection.query(
        'SELECT COUNT(*) as count FROM usuario WHERE nome_usuario = ?',
        [nome_convidado],
        (err, results) => {
            if (err) throw err;
            const count = results[0].count;
            res.json({ exists: count > 0 });
        }
    );}
});


// Rota para obter todos os convites do usuário atual
app.get('/convites/:username', isAuthenticated, (req, res) => {
    console.log("Entrei no convites/:username")
    const username = req.session.user;

    const sqlQuery = `
    SELECT * FROM lista_usuario WHERE nome_usuario = ? AND validada = FALSE
`   ;

    connection.query(sqlQuery, [username], (err, results) => {
        if (err) {
            console.error('Erro ao recuperar convites do usuário:', err);
            res.status(500).json({ success: false, message: 'Erro ao recuperar convites do usuário' });
            return;
        }
        res.json(results);
    });
});

//Rota para aceitar convite
app.put('/convites/aceitar/:nome_lista/:nome_criador_lista',(req,res)=>
{
    const {nome_lista,nome_criador_lista} = req.params;
    const usuario = req.session.user;
    const sqlQuery = `UPDATE lista_usuario SET validada = TRUE WHERE nome_usuario = ? AND nome_lista = ? AND nome_criador_Lista = ?`;
    const sqlParams = [usuario,nome_lista,nome_criador_lista]

    connection.query(sqlQuery,sqlParams,(err,results) =>{
        if (err) {
            console.error('Erro ao recuperar convites do usuário:', err);
            res.status(500).json({ success: false, message: 'Erro ao recuperar convites do usuário' });
            return;
        }
        res.json(results);
    });


});

//Rota para deletar convites
app.delete('/convites/recusar/:list_nome/:list_nome_criador',(req,res)=>{
    const {list_nome,list_nome_criador} = req.params;
    const usuario = req.session.user;
    console.log("Entrei no DELETE: nome_lista: ",list_nome," User: ",usuario, "Criador_lista: ",list_nome_criador)
    const sqlQuerry = `DELETE FROM lista_usuario WHERE  nome_usuario = ? AND nome_lista = ? AND nome_criador_lista = ? AND validada = FALSE`;
    const sqlParams = [usuario,list_nome,list_nome_criador]

    connection.query(sqlQuerry,sqlParams,(err,results)=>{
        if (err) {
            console.error('Erro ao deletar convites do usuário:', err);
            res.status(500).json({ success: false, message: 'Erro ao recuperar convites do usuário' });
            return;
        }
        res.json(results);
    });

});

// Rota para deletar uma tarefa
app.delete('/tarefas/:titulo_tarefa', (req, res) => {
    const { titulo_tarefa } = req.params;
    const { nome_lista, nome_criador_lista } = req.body;
    const responsavel = req.session.user;
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    const deleteQuery = 'DELETE FROM tarefa WHERE nome_lista = ? AND nome_criador_lista = ? AND titulo = ?';
    const deleteParams = [nome_lista, nome_criador_lista, titulo_tarefa];

    const updateQuery = 'UPDATE lista SET data_mod = ?, responsavel_mod = ? WHERE nome = ? AND nome_criador = ?';
    const updateParams = [currentTime, responsavel, nome_lista, nome_criador_lista];

    connection.query(deleteQuery, deleteParams, (err, results) => {
        if (err) {
            console.error('Erro ao deletar tarefa:', err);
            return res.status(500).json({ error: 'Erro ao deletar tarefa' });
        }
        connection.query(updateQuery, updateParams, (err) => {
            if (err) {
                console.error('Erro ao atualizar a lista:', err);
                return res.status(500).json({ error: 'Erro ao atualizar a lista' });
            }
            res.status(204).send(); 
        });
    });
});


// Rota para a página de convites
app.get('/invites', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'invites.html'));
});

// Rota para a página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Rota para a página de registro
app.get('/registrate', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registrate.html'));
});

// Rota para a página de registro
app.put('/registrate/:nome/:email/:username/:senha/:telefone', (req, res) => {
    const{nome, email, username, senha, telefone} = req.params;
    
    connection.query(`INSERT INTO usuario (nome_usuario, senha, nome, telefone, email) VALUES(?,?,?,?,?)`,[username,senha,nome,telefone,email],(err,results)=>{
        if (err) {
            console.error('Erro ao criar usuário: ', err);
            res.status(500).json({ success: false, message: 'Erro ao criar usuário' });
            return;
        }else{
            res.json({ success: true });
        }

    });

    console.log("Entrei no servidor")
});

app.get('/registrate/:username/existe', (req, res) => {
    const { username } = req.params;
    console.log("Username a ser verificado: ", username);
    
    connection.query(`SELECT COUNT(*) as count FROM usuario WHERE nome_usuario = ?`, [username], (err, results) => {
        if (err) {
            console.error('Erro ao verificar se usuário existe: ', err);
            res.status(500).json({ success: false, message: 'Erro ao verificar se usuário existe' });
            return;
        }
        
        const count = results[0].count;
        console.log('count: ', count);
        const exists = count > 0;
        console.log('exists: ', exists);
        res.json({ exists: exists });
    });

    console.log("Entrei no servidor com o verificar username");
});









//Rota pra ver se um usuário com este e-mail já existe
app.get('/registrate/:email/email-existe', (req, res) => {
    const { email } = req.params;
    console.log("email a ser verificado: ", email);
    
    connection.query(`SELECT COUNT(*) as count FROM usuario WHERE email = ?`, [email], (err, results) => {
        if (err) {
            console.error('Erro ao verificar se usuário existe: ', err);
            res.status(500).json({ success: false, message: 'Erro ao verificar se email existe' });
            return;
        }
        
        const count = results[0].count;
        console.log('count: ', count);
        const exists = count > 0;
        console.log('exists: ', exists);
        res.json({ exists: exists });
    });

    console.log("Entrei no servidor com o verificar e-mail");
});



// Rota para autenticação
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    connection.query(
        'SELECT * FROM usuario WHERE nome_usuario = ? AND senha = ?',
        [username, password],
        (err, results) => {
            if (err) {
                console.error('Erro ao autenticar usuário: ', err);
                res.status(500).json({ success: false, message: 'Erro ao autenticar usuário' });
                return;
            }

            if (results.length > 0) {
                req.session.user = username;
                res.json({ success: true });
            } else {
                res.json({ success: false, message: 'Usuário ou senha inválidos' });
            }
        }
    );
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Rota para a aplicação principal
app.get('/app', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

//Rota pra index  
app.get('/index', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//Rota pra tarefa  
app.get('/tarefa', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'task.html'));
});

//Rota pra se criar uma tarefa 
app.post('/tarefas', isAuthenticated, (req, res) => {
    const { nome_criador_lista, nome_lista, titulo, descricao, data_vencimento } = req.body;
    const nome_criador_tarefa = req.session.user;
    const responsavel = req.session.user;
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    const queryParamsLista = [currentTime, responsavel, nome_lista, nome_criador_lista];
    const queryLista = `UPDATE lista SET data_mod = ?, responsavel_mod = ? WHERE nome = ? AND nome_criador = ?`;
    const queryInsertTask = 'INSERT INTO tarefa (nome_lista, nome_criador_lista, titulo, descricao, data_cadastro, verifica_conclusao, data_vencimento, nome_criador_tarefa) VALUES (?, ?, ?, ?, NOW(), False, ?, ?)';
    const queryInsertParams = [nome_lista, nome_criador_lista, titulo, descricao, data_vencimento, nome_criador_tarefa];

    connection.query(queryInsertTask, queryInsertParams, (err, results) => {
        if (err) {
            console.error('Erro ao inserir a tarefa:', err);
            return res.status(500).json({ error: 'Erro ao criar a tarefa' });
        }
        connection.query(queryLista, queryParamsLista, (err, updateResults) => {
            if (err) {
                console.error('Erro ao atualizar a lista pela tarefa:', err);
                return res.status(500).json({ error: 'Erro ao atualizar a lista pela tarefa' });
            }
            res.status(201).json({ id_tarefa: results.insertId, message: 'Tarefa e lista atualizadas com sucesso' });
        });
    });
});

//Rota pra ver se a lista já existe
app.get('/listas/:nome_lista/existe', (req, res) => {
    const { nome_lista } = req.params;
    const criador = req.session.user;
    connection.query(
        'SELECT COUNT(*) as count FROM lista WHERE nome_criador = ? AND nome = ?',
        [criador, nome_lista],
        (err, results) => {
            if (err) throw err;
            const count = results[0].count;
            res.json({ exists: count > 0 });
        }
    );
});

// Rota para atualizar o título de uma lista
app.put('/listas/:nome/:nome_criador/:novo_nome', (req, res) => {
    
    const {nome,nome_criador,novo_nome} = req.params;


    console.log("Entrei. Nome: ",nome, " Criador: ",nome_criador);
    console.log("entrei no mudar nome da tarefa, nome:",nome," Criador: ",nome_criador,"Para: ",novo_nome);
    console.log("Nome     ",nome)

    connection.query(
        `UPDATE lista SET nome = ? WHERE nome = ? AND nome_criador = ?`,
        [novo_nome, nome,nome_criador],
        (err, results) => {
            if (err) throw err;
            res.json(results);
        }
    );
});

// Rota pra adicionar uma lista
app.post('/listas/:username', isAuthenticated, (req, res) => {
    const username = req.session.user;
    const { nome } = req.body;
    connection.query(
        'INSERT INTO lista (nome, nome_criador, data_criacao,data_mod,responsavel_mod ) VALUES (?, ?, NOW(), NOW(), ?)',
        [nome, username , username]
    );
    connection.query(
        'INSERT INTO lista_usuario (nome_usuario, nome_lista, nome_criador_lista,validada ) VALUES (?, ?, ?,TRUE)',
        [username,nome, username],
        (err, results) => {
            if (err) throw err;
            res.status(201).json({ id_tarefa: results.insertId });
        }
    );
});

// Rota para obter os detalhes de uma tarefa específica
app.get('/tarefas/:titulo_tarefa/:nome_lista/:nome_criador', (req, res) => {
    const { titulo_tarefa, nome_lista, nome_criador } = req.params;
    
    console.log("Título-tarefa: ",titulo_tarefa)
    console.log("nome_criador: ",nome_criador)
    console.log("nome_lista: ",nome_lista)

    connection.query('SELECT * FROM tarefa WHERE titulo = ? AND nome_lista = ? AND nome_criador_lista = ?', [titulo_tarefa, nome_lista, nome_criador], (err, results) => {
        if (err) throw err;
        res.json(results[0]);
    });
});

// Rota para atualizar tarefa
app.put('/tarefas/:titulo/:nome_lista/:nome_criador', (req, res) => {
    const responsavel = req.session.user
    console.log("Responsável: ",responsavel)
    const { titulo, nome_lista, nome_criador } = req.params;
    const { novo_titulo, descricao, data_vencimento, verifica_conclusao } = req.body;
    console.log("titulo: ",titulo,"\nlista: ",nome_lista,"\ncriador_lista: ",nome_criador,"\nnovo_titulo: ",novo_titulo,"\ndescricao: ",descricao,"\ndata_vencimento: ", data_vencimento,"\nverifica_conclusão: ", verifica_conclusao)
    console.log("novo_titulo: ",novo_titulo)
    let queryParts = [];
    let queryParams = [];

    if (novo_titulo !== undefined) {
        queryParts.push('titulo = ?');
        queryParams.push(novo_titulo);
    }
    if (descricao !== undefined) {
        console.log("entrei pra mudar a descrição, a nova é: ",descricao)
        queryParts.push('descricao = ?');
        queryParams.push(descricao);
    }
    if (data_vencimento !== undefined) {
        queryParts.push('data_vencimento = ?');
        queryParams.push(data_vencimento);
    }
    if (verifica_conclusao !== undefined) {
        queryParts.push('verifica_conclusao = ?');
        queryParams.push(verifica_conclusao);
    }

    if (queryParts.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    queryParams.push(titulo, nome_lista, nome_criador);

    let queryParamsLista = []
    currentTime = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log("date.now: ",currentTime)

    queryParamsLista.push(currentTime,responsavel,nome_lista,nome_criador)


    const queryLista = `UPDATE lista SET data_mod = ?, responsavel_mod = ? WHERE nome = ? AND nome_criador = ? `

    const query = `UPDATE tarefa SET ${queryParts.join(', ')} WHERE titulo = ? AND nome_lista = ? AND nome_criador_lista = ?`;
    console.log("query: ",query)
    console.log("queryParams: ",queryParams)

    connection.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Erro ao atualizar a tarefa:', err);
            return res.status(500).json({ error: 'Erro ao atualizar a tarefa' });
        }

        connection.query(queryLista, queryParamsLista, (err, results) => {
            if (err) {
                console.error('Erro ao atualizar a lista pela tarefa:', err);
                return res.status(500).json({ error: 'Erro ao atualizar a lista pela tarefa' });
            }
            res.json({ message: 'Lista pela Tarefa atualizada com sucesso', results });
        });
    });

});






























































app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});