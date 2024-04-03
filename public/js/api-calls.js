// Pega as informações do asset interno
function retrieveInternalAssetInfo(token, parameter) {
    // Verifica o codigo mandando um solicitação HTTP para a API.
    const opt = {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'authorization': token
        },
        /*body: JSON.stringify({
            qr: document.getElementById('result').value
        })*/
    };

    // Pede para a API fornecer dados sobre as tags internas
    fetch(`/restapi_v1/assets/internal/${ parameter }`, opt)
        .then((response) => response.json())
        .then(data => { 
            // Colocando informações nos campos
            if(data.has_info) 
            {
                document.getElementById('n-content').innerHTML = 'Nome: ' + data.name;
                document.getElementById('l-content').innerHTML = 'Localização: ' + data.localization;
                document.getElementById('int-content').innerHTML = 'Loc Interna: ' + data.loc_internal;
                document.getElementById('c-content').innerHTML = 'Codigo: ' + data.code;
                document.getElementById('s-content').innerHTML = 'Departamento: ' + data.depart;
                
                (data.being_used) ? document.getElementById('u-content').innerHTML = `Em Uso: <img src="/ok.png" alt="" width="20px" style="position: absolute; margin-left: 6px;">`
                : document.getElementById('u-content').innerHTML = `Em Uso: <img src="/wrong.png" alt="" width="20px" style="position: absolute; margin-left: 6px;">`
            }
            else
            {
                alert('Este ativo não esta cadastrado em nosso sistema.')
            }
        }).catch((error) => alert(error))
}

// Verifica se aquele asset interno existe, caso exista ele filtra o asset, caso não exista abre uma janela de cadastro.
function checkIsAvailable(token, parameter) {
    // Verifica o codigo mandando um solicitação HTTP para a API.
    const opt = {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'authorization': token
        },
        /*body: JSON.stringify({
            qr: document.getElementById('result').value
        })*/
    };

    // Pede para a API fornecer dados sobre as tags internas
    fetch(`/restapi_v1/assets/internal/${ parameter }`, opt)
        .then((response) => response.json())
        .then(data => { 
            // Verificando se o resultado contem alguma informação ou não.
            if(data.has_info) 
            {
                // Filtrar o asset cadastrado e mostrar na pagina.
                document.getElementById('assets-listing').innerHTML = `
                    <div class="container" id=${ 0 }>
                        <img src="/fakeQR.png" alt="" />

                        <div class="infos">
                            <span class="name">${ data.name }</span>
                            <span class="owner">Reponsavel: ${ data.depart }</span>
                            <span class="user">Cadastrado por: ${ data.created_by }</span>
                            <span class="code">#${ data.code }</span>
                        </div>

                        <div class="options" style="position: absolute; top: 4px; right: 4px;">
                            <button type="button"><img src="/apagar.png" alt="" width="20px"></button>
                            <button type="button"><img src="/editar.png" alt="" width="20px"></button>
                        </div>
                    </div><!-- Criado dinamicamente -->
                `;
            }
            else
            {
                // Cadastrar.
                let logPopup = document.getElementById('window-reg');
                logPopup.style.animation="openAnimation 0.2s";
                let backPopup = document.getElementById('background');
                backPopup.style.animation="openBackground 0.2s";
                
                // Parar animação e executar os elementos apos abrir a janela
                delay (150).then (() => { 
                    logPopup.style.display="block";
                    logPopup.style.opacity= "1";
                    backPopup.style.display="block";
                    backPopup.style.opacity= "0.5";

                    // colocando o codigo 
                    document.getElementById('reg_codigo').value = document.getElementById('result').value;
                });

            }
        }).catch((error) => alert(error))
}

// Lista todos os assets disponiveis no sistema.
function listAvailableInternalAssets(token) {
    // Verifica o codigo mandando um solicitação HTTP para a API.
    const opt = {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'authorization': token
        },
    };

    // Pede para a API fornecer dados sobre as tags internas
    fetch(`/restapi_v1/assets/internal/`, opt)
        .then((response) => response.json())
        .then(data => { 
            // Verificando se o resultado contem alguma informação ou não.
            console.log(data)
            if(data.length > 0) 
            {
                for (let i = 0; i < data.length; i++) 
                {
                    // Adiciona dinamicamente os resultados
                    document.getElementById('assets-listing').innerHTML += `
                        <div class="container" id=${ i }>
                            <img src="/fakeQR.png" alt="" />
    
                            <div class="infos">
                                <span class="name">${ data[i].name }</span>
                                <span class="owner">Reponsavel: ${ data[i].depart }</span>
                                <span class="user">Cadastrado por: ${ data[i].created_by }</span>
                                <span class="code">#${ data[i].code }</span>
                            </div>
    
                            <div class="options" style="position: absolute; top: 4px; right: 4px;">
                                <button type="button"><img src="/apagar.png" alt="" width="20px"></button>
                                <button type="button"><img src="/editar.png" alt="" width="20px"></button>
                            </div>
                        </div>
    
                    `;
                }
            }
            else
            {
                alert("Nenhum asset cadastrado.");
            }
        }).catch((error) => alert(error))
}