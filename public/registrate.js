document.getElementById("RegisterForm").addEventListener('submit',async(e)=>{
    e.preventDefault();
    const eMail = document.getElementById("e-mail").value;
    const nome = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const senha = document.getElementById("password").value;
    const telefone = document.getElementById("telefone").value;

    console.log('username: ',username)
    try{
        const response = await fetch(`/registrate/${encodeURIComponent(username)}/existe`);
        const usernameExiste = await response.json()
        console.log("response: ",usernameExiste)
        console.log("response.exists: ",usernameExiste.exits)

        if (usernameExiste.exists) {
            alert("Usuário com este username já existe.");
            return;
        }


        const response2 = await fetch(`/registrate/${encodeURIComponent(eMail)}/email-existe`);
        const e_mailExiste = await response2.json()
        console.log("response: ",e_mailExiste)
        console.log("response.exists: ",e_mailExiste.exits)

        if (e_mailExiste.exists) {
            alert("Usuário com este e-mail já existe.");
            return;
        }




    }catch(error){
        console.log("Erro ao cadastrar usuário: ",error);
        alert("Erro ao cadastrar");
    }
 
    fetch(`/registrate/${encodeURIComponent(nome)}/${encodeURIComponent(eMail)}/${encodeURIComponent(username)}/${encodeURIComponent(senha)}/${encodeURIComponent(telefone)}`,{
        method: "PUT",
    });
    window.location.href = "/login";

});



const goLoginButton = document.getElementById("goLoginButton");
    
goLoginButton.addEventListener('click',() => {
    window.location.href = '/login'     

});