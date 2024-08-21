
document.addEventListener('DOMContentLoaded', () => {
    const nome_lista = localStorage.getItem("nome_lista")
    const criador_lista = localStorage.getItem("nome_criador")
    const newInviteButton = document.getElementById('new-invite-button')

    newInviteButton.addEventListener('click',async(e)=>{
        e.preventDefault();
        const nome_convidado = prompt("Nome do convidado: ")
        console.log("Nome_convidado:",nome_convidado)

        try{
            const response = await fetch(`/convites/${nome_convidado}/existe`);
            const data = await response.json()

            if(data.exists){
                alert("Usuário existe")
                console.log("nome_lista:",nome_lista)
                console.log("Criador_lista:",criador_lista)
                fetch(`/convites/${encodeURIComponent(nome_convidado)}/${encodeURIComponent(nome_lista)}/${encodeURIComponent(criador_lista)}`,{
                    method: 'POST',
                });
            }else{
                alert("Usuário não existe, ou você está tentando se convidar")
            }
        
        }catch(error){
            console.error("Erro ao convidar um usuário: ",error)
        }

    })













    const goBackButton = document.getElementById("backButton");
        goBackButton.addEventListener('click',() => {
        window.location.href = '/app'     
    
    })

});