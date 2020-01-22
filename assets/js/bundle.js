(() => {
    
    // CUSTOM SELECTORS
    const selector = selector => document.querySelector(selector);
    const create = element => document.createElement(element);

    // MAIN CONTAINER #APP IT HOLDS ALL THE ELEMENTS
    const app = selector('#app');
    
    // CREATING ALL THE MAIN BLOCKS   
    const centralizer = create('div');
    centralizer.classList.add('centralizer');
    app.appendChild(centralizer);

    // KEEPS THE APP CENTRALIZED 
    const marginAuto = create('div');
    marginAuto.classList.add('marginAuto');
    centralizer.appendChild(marginAuto);

    // LOGO
    const Logo = create('img');
    Logo.src = './assets/images/logo.svg';
    Logo.classList.add('logo');
    marginAuto.appendChild(Logo);

    // LOGIN CONTAINER
    const Login = create('div');
    Login.classList.add('login');
    marginAuto.appendChild(Login);


    /* REQUEST AJAX CONFIGURATIONS
    ---------------------------------------------------------------------------------*/
    //HEADER
    const h = new Headers();
    h.append('Accept','application/json');

    // REQUEST READY TO BE SEND
    const requestReady = new Request({method: 'GET',headers: h, mode: 'cors', cache: 'default'});
    
    // IT NEEDS 'URL TO BE CALL' + requestReady
    // ajaxCaller('http://www.mocky.io/v2/5dba690e3000008c00028eb6',requestReady)
    const ajaxCaller = async (url, requestReady) => {
        // FETCH
        const api_call = await fetch(url);
        
        // RESPONSE STATUS
        if(!api_call.ok){
            throw new Error(api_call.status);
            
        }else{
            // IF STATUS OK 
            const data = await api_call.json();
            return {data};
        }
    }


    // FORM CREATING
    const Form = create('form');

    //BUTTON ENTRAR (ENABLE AND DISEABLE) 
    Form.oninput = e => {
        const [email, password, button] = e.target.parentElement.children;
        (!email.validity.valid || !email.value || password.value.length <=5) 
            ? button.classList.remove('button')
            : button.classList.add('button');
    }

    // FORM PRINTER ITSELF    
    Form.innerHTML = `
        <form action="" method="">
            <div class="formInnerContainer">
                <fieldset>
                    <input id="email" type="text"name ="email"  placeholder="Entre com seu e-mail" />
                    <input id="password" type="password" name="password"  placeholder="Digite sua senha supersecreta" />
                    <input type="submit" value="Entrar"/>
                </fieldset>
            </div>
        </form>`;
    Login.appendChild(Form);

    
    // REGEX VALIDATING EMAIL INPUT FIELD
    const validEmail = (email) => {
        return /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/.test(email)
    }

    // REMOVE MSG ERROR "errorRequiredField"
    const inputTexts = document.querySelectorAll('.formInnerContainer input[type=text]');
    const cleanInputMask = (inputTexts) =>{
        inputTexts.forEach(element => {
            element.addEventListener('click',function(e){
                e.stopPropagation();
                e.target.classList.remove('errorRequiredFiled');
                e.target.value = ""; 
             });
        });   
    }

    // ADD MSG ERROR "errorRequiredField"
    const setMsgRiquiredField = (inputTexts) =>{
        inputTexts.forEach(element => {
            element.addEventListener('blur',function(e){
                e.stopPropagation();
                // CHECK VALID EMAIL
                if ((validEmail(e.target.value)) === false) {
                    e.target.classList.add('errorRequiredFiled');
                }
             });
        });   
    }
    setMsgRiquiredField(inputTexts);
    cleanInputMask(inputTexts);

    // FORM VALIDATION
    Form.onsubmit = async e => {
        e.preventDefault();
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        
        let autenticado = await fakeAuthenticate(email, password);
        
        if (autenticado === true) {
            // AJAX
            ajaxCaller('http://www.mocky.io/v2/5dba690e3000008c00028eb6',requestReady).then((response) => {
                location.href='#users';
                getDevelopersList(response.data.url);
             })
               .catch(err => {
                   console.log(err);
            })      
        }else{
            location.href='#login';
            marginAuto.appendChild(Login);
        }
    };

    // SET SESSION STORAGE
    async function fakeAuthenticate(email, password) {
        sessionStorage.setItem('token', JSON.stringify(`${btoa(email+password)}.${(new Date()).getTime()+300000}`)); 
        return true;
    }

    // GET LIST AFTER  AJAX DONE
    async function getDevelopersList(url) {
        let newCall = url;
        ajaxCaller(newCall,requestReady).then((response) => {
                location.href='#users';
                renderPageUsers(response)
             })
               .catch(err => {
                   console.log(err);
            })  
    }
    
    // PRINTER DEVELOPER PAGE
    function renderPageUsers(users) {
       app.classList.add('logged');
       Login.style.display = 'none'; 

        const Ul = create('ul');
        Ul.classList.add('containerUser')
        marginAuto.appendChild(Ul);


        let lis ='';
        users.data.forEach(item => {
            lis += `<li><a href="${item.html_url}" target="_blank"><img src="${item.avatar_url}" alt="${item.login}"></a><span>${item.login}</span></li>`;
        })  
        document.querySelector('.containerUser').insertAdjacentHTML("beforeend", lis);
    }

    // init
    (async function(){
        const rawToken = sessionStorage.getItem('token');
        const token = rawToken ? rawToken.split('.') : null
        if (!token || token[2] < (new Date()).getTime()) {
            localStorage.removeItem('token');
            location.href='#login';
            marginAuto.appendChild(Login);
        } else {
            location.href='#users';
            const users = await getDevelopersList(atob(token[1]));
            renderPageUsers(users);
        }
    })()
   
  
})()