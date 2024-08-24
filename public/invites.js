
document.addEventListener('DOMContentLoaded', () => {
    
    const list_of_invites = document.getElementById('invites');


    const loadInvites = () => {
        fetch('/convites/:username') 
            .then(response => response.json())
            .then(invites => {
                list_of_invites.innerHTML = '';
                invites.forEach(invite => {
                    console.log("INVITE")
                    const inviteElement = document.createElement('div');
                    const safeNome = encodeURIComponent(invite.nome_lista)
                    const safeNomeCriadorLista = encodeURIComponent(invite.nome_criador_lista)
                    
                    console.log("safeNome: ",safeNome);
                    console.log("safeNome: ",safeNomeCriadorLista);
                    inviteElement.innerHTML = `
                        <span>Nome da lista: ${invite.nome_lista} Criador da lista: ${invite.nome_criador_lista} </span>
                        <button class = "delete-invite-button" x = "${safeNome}" y = "${safeNomeCriadorLista}"->Excluir</button> 
                        <button class = "accept-invite-button" x = "${safeNome}" y = "${safeNomeCriadorLista}"->Aceitar</button>

                    `;
                    // <button onclick="deleteinvite('${invite.nome}', '${invite.nome_criador}')">Excluir</button>
                    list_of_invites.appendChild(inviteElement);
                });

                document.querySelectorAll('.accept-invite-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const nome = event.target.getAttribute('x');
                        const nome_criador = event.target.getAttribute('y');
                        console.log("nome da lista do convite: ",nome,"Criador: ",nome_criador)
                        acceptInvite(nome,nome_criador);
                        window.location.reload();
                    });
                });

                document.querySelectorAll('.delete-invite-button').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const nome = event.target.getAttribute('x');
                        const nome_criador = event.target.getAttribute('y');
                        console.log("nome da lista do convite que vou excluir: ",nome,"Criador: ",nome_criador)
                        deleteInvite(nome,nome_criador);
                    });
                });




            });
    };

    loadInvites();

    //Função pra aceitar o convite
    window.acceptInvite = (list_nome,list_nome_criador)=>{
        
        fetch(`convites/aceitar/${list_nome}/${list_nome_criador}`,{
            method: 'PUT',
        })
        
    }

    window.deleteInvite = (list_nome,list_nome_criador)=>{
        
        fetch(`convites/recusar/${list_nome}/${list_nome_criador}`,{
            method: 'DELETE',
        })
        window.location.reload()
        
    }






    const goBackButton = document.getElementById("backButton");
        goBackButton.addEventListener('click',() => {
        window.location.href = '/app'     
    
    })

});