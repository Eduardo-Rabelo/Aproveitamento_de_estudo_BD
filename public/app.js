
document.addEventListener('DOMContentLoaded', () => {
    const list_of_lists = document.getElementById('lists');
    const newListForm = document.getElementById('new-list-form');
    const newListName = document.getElementById('new-list-name');

    // Função para carregar tarefas
    const loadLists = () => {
        fetch('/listas/:username') 
            .then(response => response.json())
            .then(lists => {
                list_of_lists.innerHTML = '';
                lists.forEach(list => {
                    const listElement = document.createElement('div');
                    const safeNome = encodeURIComponent(list.nome)
                    const safeNomeCriadorLista = encodeURIComponent(list.nome_criador)
                    const data_mod = moment(list.data_mod).format('YYYY-MM-DD HH:mm:ss'); 
                    const data_criacao = moment(list.data_criacao).format('YYYY-MM-DD HH:mm:ss'); 
                    console.log("dataMod: ",data_mod)
                    console.log("safeNome: ",safeNome);
                    console.log("safeNome: ",safeNome);
                    listElement.innerHTML = `
                        <h2>Minha lista</h2>
                        <span>Nome: ${list.nome} Criador: ${list.nome_criador} data da Criação: ${data_criacao}  ultima_modificação: ${data_mod} </span>
                        <button class = "delete-list-button" x = "${safeNome}" y = "${safeNomeCriadorLista}"->Excluir</button> 
                        <button class = "enter-list-button" x = "${safeNome}" y = "${safeNomeCriadorLista}"->Entrar</button>
                        <button class = "edit-list-title-button" x = "${safeNome}" y = "${safeNomeCriadorLista}"->Mudar nome</button>

                    `;
                    // <button onclick="deleteList('${list.nome}', '${list.nome_criador}')">Excluir</button>
                    list_of_lists.appendChild(listElement);
                });

                document.querySelectorAll('.enter-list-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const nome = event.target.getAttribute('x');
                        const nome_criador = event.target.getAttribute('y');
                        console.log("nome da lista que vou entrar: ",nome,"Criador: ",nome_criador)
                        enterList(nome,nome_criador);
                    });
                });

                document.querySelectorAll('.edit-list-title-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const nome = event.target.getAttribute('x');
                        const nome_criador = event.target.getAttribute('y');
                        const novo_nome = encodeURIComponent(prompt("Novo Nome:"));
                        
                        if(novo_nome === null || novo_nome.trim() === ""){
                            alert("Nome Inválido")
                            return
                        };
                        
                        console.log("nome da lista cujo nome vou mudar:: ",nome,"Criador: ",nome_criador,"NovoNome: ",novo_nome)

                        editListTitle(nome,nome_criador,novo_nome);
                    });
                });

                document.querySelectorAll('.delete-list-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const nome = event.target.getAttribute('x');
                        const nome_criador = event.target.getAttribute('y');
                        console.log("nome da lista que vou excluir: ",nome,"Criador: ",nome_criador)
                        deleteList(nome,nome_criador);
                    });
                });




            });
    };


    const loadSharedLists = () => {
        fetch('/listas/:username/compartilhadas') 
            .then(response => response.json())
            .then(lists => {
                // list_of_lists.innerHTML = '';
                lists.forEach(list => {
                    const listElement = document.createElement('div');
                    const safeNome = encodeURIComponent(list.nome)
                    const safeNomeCriadorLista = encodeURIComponent(list.nome_criador)
                    const data_mod = moment(list.data_mod).format('YYYY-MM-DD HH:mm:ss'); 
                    const data_criacao = moment(list.data_criacao).format('YYYY-MM-DD HH:mm:ss'); 
                    console.log("dataMod: ",data_mod)
                    console.log("safeNome: ",safeNome);
                    console.log("safeNome: ",safeNome);
                    listElement.innerHTML = `
                        <h2>Lista Compartilhada</h2>
                        <span>Nome: ${list.nome} Criador: ${list.nome_criador} data da Criação: ${data_criacao}  ultima_modificação: ${data_mod} ultimo_a_modificar: ${list.responsavel_mod}</span> 
                        <button class = "enter-list-button" x = "${safeNome}" y = "${safeNomeCriadorLista}"->Entrar</button>
                        <button class = "edit-list-title-button" x = "${safeNome}" y = "${safeNomeCriadorLista}"->Mudar nome</button>

                    `;
                    // <button onclick="deleteList('${list.nome}', '${list.nome_criador}')">Excluir</button>
                    list_of_lists.appendChild(listElement);
                });

                document.querySelectorAll('.enter-list-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const nome = event.target.getAttribute('x');
                        const nome_criador = event.target.getAttribute('y');
                        console.log("nome da lista que vou entrar: ",nome,"Criador: ",nome_criador)
                        enterList(nome,nome_criador);
                    });
                });

                document.querySelectorAll('.edit-list-title-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const nome = event.target.getAttribute('x');
                        const nome_criador = event.target.getAttribute('y');
                        const novo_nome = encodeURIComponent(prompt("Novo Nome:"));
                        
                        if(novo_nome === null || novo_nome.trim() === ""){
                            alert("Nome Inválido")
                            return
                        };
                        
                        console.log("nome da lista cujo nome vou mudar:: ",nome,"Criador: ",nome_criador,"NovoNome: ",novo_nome)

                        editListTitle(nome,nome_criador,novo_nome);
                    });
                });

                document.querySelectorAll('.delete-list-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const nome = event.target.getAttribute('x');
                        const nome_criador = event.target.getAttribute('y');
                        console.log("nome da lista que vou excluir: ",nome,"Criador: ",nome_criador)
                        deleteList(nome,nome_criador);
                    });
                });




            });
    };













    //Função pra entrar na lista
    window.enterList = (list_nome,list_nome_criador)=>{
        list_nome = decodeURIComponent(list_nome)
        list_nome_criador = decodeURIComponent(list_nome_criador)
        console.log("Entrar na lista:", list_nome, list_nome_criador);
        localStorage.setItem('nome_lista',list_nome);
        localStorage.setItem('nome_criador',list_nome_criador);
        window.location.href = '/index';
    }

    //Função pra editar nome da lista
    window.editListTitle = (list_nome,list_nome_criador,novo_nome)=>{
        list_nome = decodeURIComponent(list_nome)
        list_nome_criador = decodeURIComponent(list_nome_criador)
        novo_nome = decodeURIComponent(novo_nome)
        console.log("Estou no editListTitle : mudar a lista:", list_nome, list_nome_criador,"Para: ",novo_nome);
        console.log("List nome sem : antes de entrar na rota     ",list_nome)
        try{

            fetch(`/listas/${encodeURIComponent(list_nome)}/${encodeURIComponent(list_nome_criador)}/${encodeURIComponent(novo_nome)}`, {
                method: 'PUT',
            });


        }catch (error) {
            console.error('Erro ao mudar nome da lista:', error);
        }
        window.location.reload();
    }

    

     // Função para adicionar nova lista
     newListForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = newListName.value;
        console.log("name : ", name)
        try {
            const response = await fetch(`/listas/${name}/existe`);
            const data = await response.json();
            console.log("DATA: ",data)
            if (data.exists) {
                alert('Este usuário já criou uma lista com este nome');
                return;
            }
            if(name === null || name.trim() === ""){
                alert("Nome Inválido")
                return
            }

            await fetch(`/listas/:username`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: name
                })
            });

            newListName.value = '';
            loadLists();
            loadSharedLists();
        } catch (error) {
            console.error('Erro ao verificar ou criar a lista:', error);
        }
    });

   // Função para deletar uma lista
    
    window.deleteList = (nome_lista, nome_criador_lista) => {
       nome_lista = decodeURIComponent(nome_lista);
       nome_criador_lista = decodeURIComponent(nome_criador_lista);
        fetch(`/listas/${encodeURIComponent(nome_lista)}/${encodeURIComponent(nome_criador_lista)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            loadLists();
            loadSharedLists();
        });
    };
    


    // Carregar tarefas ao carregar a página
    loadLists();
    loadSharedLists();

    const goBackButton = document.getElementById("backButton");
        goBackButton.addEventListener('click',() => {
        window.location.href = '/login'     
    
    })

    const inviteButton = document.getElementById("inviteButton");
        inviteButton.addEventListener('click',() => {
        window.location.href = '/invites'     
    
    })

    //Usa a rota pra pegar o número de convites
    async function verificarNotificacoes() { 
        try {
            const response = await fetch(`/notificacoes/:nome_usuario`);
            const data = await response.json();
            
            if (data.count > 0) {
                mostrarNotificacao(data.count);
            }
        } catch (error) {
            console.error('Erro ao verificar notificações:', error);
        }
    }

    //Cria a notificação de convites
    function mostrarNotificacao(contagem) {
        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification';
        notificationElement.textContent = `Você tem ${contagem} convite(s).`;
        
        document.body.appendChild(notificationElement);
        
        // Opcional: Adicionar estilos e lógica para a notificação desaparecer após um tempo
        setTimeout(() => {
            notificationElement.remove();
        }, 3000);
    }
    
    // Chamar a função de verificação de convites quando o usuário carrega a página
    window.addEventListener('load', verificarNotificacoes);
    
    
    // loadTasks();
});
