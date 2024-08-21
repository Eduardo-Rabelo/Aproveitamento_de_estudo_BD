document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.getElementById('todo-list');
    const newTaskForm = document.getElementById('new-task-form');
    const newTaskTitle = document.getElementById('new-task-title');
    const lista = localStorage.getItem("nome_lista");
    const criador = localStorage.getItem("nome_criador")
    // const nome_criador_lista = localStorage.getItem("nome_criador_lista")

    console.log("Entrei na lista: ",lista," Criador: ",criador)

    // Função para deletar uma tarefa
    window.deleteTask = (titulo_tarefa) => {
        // alert("ENTROU NA FUNÇÂO DE DELETAR")
        fetch(`/tarefas/${titulo_tarefa}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome_lista: lista, // substitua pelo nome da lista desejada
                nome_criador_lista: criador, // substitua pelo nome do criador da lista
            })
        }).then(() => {
            loadTasks();
        });
    };


  
      //Função pra entrar na tarefa
    window.enterTask = (titulo)=>{
        // alert("Entrei na função")
        titulo = decodeURIComponent(titulo)
        console.log("safeTitle: ",titulo)
        list_nome = localStorage.getItem("nome_lista")
        list_nome_criador = localStorage.getItem("nome_criador")
        console.log("Entrar na tarefa:", titulo,list_nome, list_nome_criador);
        localStorage.setItem('titulo',titulo);
        window.location.href = '/tarefa';
    }

    
    // Função para carregar tarefas
    const loadTasks = () => {
        fetch(`/listas/${encodeURIComponent(lista)}/${encodeURIComponent(criador)}/tarefas`)
            .then(response => response.json())
            .then(tasks => {
                todoList.innerHTML = '';
                tasks.forEach(task => {
                    const safeTitle = encodeURIComponent(task.titulo); 
                    const taskElement = document.createElement('div');
                    taskElement.innerHTML = `
                        <span>Título: ${task.titulo} Criador: ${task.nome_criador_tarefa}</span>
                        <button class="enter-task-button" data-title="${safeTitle}">Entrar</button>
                        <button class="delete-task-button" data-title="${safeTitle}">Excluir</button>
                        <button class="view-task-button" data-title="${safeTitle}">Verificar</button>
                    `;
                    todoList.appendChild(taskElement);
                });
    
                // Adiciona os event listeners
                document.querySelectorAll('.enter-task-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const titulo = event.target.getAttribute('data-title');
                        enterTask(titulo);
                    });
                });
    
                document.querySelectorAll('.delete-task-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const titulo = event.target.getAttribute('data-title');
                        deleteTask(titulo);
                    });
                });
    
                document.querySelectorAll('.view-task-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const titulo = event.target.getAttribute('data-title');
                        viewTask(titulo);
                    });
                });
            });
    };
    
    //Função para adicionar nova tarefa
    newTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = newTaskTitle.value;
        console.log("title: ",title)
        if(title === null || title.trim() ===""){
            alert("Nome inválido")
            return
        }
        const description = prompt('Digite a descrição da tarefa:');
        const data_vencimento = prompt('Digite a data de vencimento da tarefa  (YYYY-MM-DD):');
        if (!isValidDate(data_vencimento)) {
            alert('Data de vencimento inválida. Use o formato YYYY-MM-DD.');
            return;
        }

        try{
            console.log("Lista_Pré:",lista)
            const url = `/tarefas/${encodeURIComponent(title)}/existe`;
            console.log('URL gerada:', url); // Debugging
    
            const response = await fetch(url,{
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        criador: criador,
                        lista_nome: lista
                    })

            });
        // const response = await fetch(`/tarefas/${encodeURIComponent(title)}/existe?criador = ${2} & nome_lista = listaDoCarlos`);
        const data = await response.json();
        console.log(data)
        if(data.exists){
                alert('Este usuário já criou uma lista com este nome');
                return;
        }
        
        await fetch('/tarefas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome_criador_lista : criador,
                nome_lista: lista, // substitua pelo nome da lista desejada
                titulo: title,
                descricao: description,
                data_vencimento: data_vencimento // substitua pelo nome do responsável pela modificação
            })
        }).then(() => {
            newTaskTitle.value = '';
            loadTasks();
        });} catch (error) {
            console.error('Erro ao verificar ou criar a tarefa:', error);
        }
    });


    // Função para validar a data
    const isValidDate = (dateString) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateString.match(regex)) return false;

        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    };


    //Funçao pra ver Tarefa
    window.viewTask = (titulo_tarefa) => {
        console.log("título_tarefa: ",titulo_tarefa)
        const lista = localStorage.getItem("nome_lista");
        const criador = localStorage.getItem("nome_criador");
        fetch(`/tarefas/${encodeURIComponent(titulo_tarefa)}/${encodeURIComponent(lista)}/${encodeURIComponent(criador)}`)
            .then(response => response.json())
            .then(task => {
                // Aqui você pode exibir os detalhes da tarefa como desejar
                const taskDetails = `
                    <div>
                        <h3>Detalhes da Tarefa</h3>
                        <p><strong>Título:</strong> ${task.titulo}</p>
                        <p><strong>Descrição:</strong> ${task.descricao}</p>
                        <p><strong>Data de Cadastro:</strong> ${task.data_cadastro}</p>
                        <p><strong>Data de Vencimento:</strong> ${task.data_vencimento}</p>
                        <p><strong>Concluída:</strong> ${task.verifica_conclusao}</p>
                    </div>
                `;
                console.log("Data Cadastro: ",task.data_cadastro)
                // Exibir os detalhes da tarefa, por exemplo, em um modal ou na própria página
                document.getElementById('task-details').innerHTML = taskDetails;
            });
    };

    // Carregar tarefas ao carregar a página
    loadTasks();
    const goBackButton = document.getElementById("backButton");
        goBackButton.addEventListener('click',() => {
        window.location.href = '/app'     
    })
});
