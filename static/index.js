const dropZone=document.querySelector(".drop-zone");
const fileInput=document.querySelector("#fileInput");
const browseBtn=document.querySelector(".browseBtn");
const bgProgress=document.querySelector(".bg-progress");
const percentDiv=document.querySelector("#percent");
const progressBar=document.querySelector(".progress-bar");
const progressContainer=document.querySelector(".progress-container");
const fileURL=document.querySelector("#fileURL");
const sharingContainer=document.querySelector(".sharing-container");
const copyBtn=document.querySelector("#copyBtn");
const emailForm=document.querySelector("#emailForm")
const toast=document.querySelector(".toast");
const maxAllowedSize=100*1024*1024;     //100 MB
//heroku upload link is disabled, so we need to create our own backened
const host ="https://inshare-gaurang.herokuapp.com/"
const uploadURL=`${host}api/files`;
const emailURL= `${host}api/files/send`;
// const uploadURL=`${host}api/files`;

dropZone.addEventListener('dragover',(e)=>{
    e.preventDefault();
    if(!dropZone.classList.contains('dragged'))
        dropZone.classList.add('dragged');
});
dropZone.addEventListener('dragleave',(e)=>{
    dropZone.classList.remove('dragged');
});
dropZone.addEventListener('drop',(e)=>{
    e.preventDefault();
    dropZone.classList.remove('dragged');
    const files=e.dataTransfer.files;
    console.log(files);
    if(files.length){
        fileInput.files=files;
        uploadFile();//calling function uploadfile when we drop any files in upload section
    }
});

fileInput.addEventListener('change',()=>{
    uploadFile();       //when we use 'choosefile' option instead of drag
});

browseBtn.addEventListener('click',(e)=>{
    fileInput.click();
});

const uploadFile=()=>{
    if(fileInput.files.length>1){
        fileInput.value="";
        showToast("Only Upload 1 file");
        return;
    }
    const file=fileInput.files[0];          //give you first file you uploaded
    if(file.size>maxAllowedSize){
        showToast("Can't upload more than 100MB");
        fileInput.value="";
        return;
    }


    progressContainer.style.display="block";
    const formData=new FormData();          //Since xml can post,get(send) form data
    formData.append("myfile",file);         //Converting file to form Data, and appending this file to formData , with name myfile

    const xhr=new XMLHttpRequest();         //this will make new object capable of handling XMLHttpRequest
    //
    xhr.onreadystatechange=()=>{  
        if(xhr.readyState===XMLHttpRequest.DONE){     //Adding event listener, i.e, when xhr is changed....., when it'll give response of 
            console.log(xhr.response);                    //Console the final response(url of file in this case) 
            
            onUploadSuccess(JSON.parse(xhr.response)); //Since we get json, after parsing we'll get object back
        }
    }

    // For Progress Bar
    xhr.upload.onprogress=updateProgress;

    //If during upload any error
    xhr.upload.onerror=()=>{
        fileInput.value="";
        showToast(`Error in Upload: ${xhr.statusText}`);
    }

    xhr.open("POST",uploadURL);             //Open(make connection) the backend url that u've ,i.e, made for you as an api
    xhr.send(formData);                     //And send that form data
};

const updateProgress=(e)=>{
    const percent=Math.round((e.loaded/e.total)*100);
    bgProgress.style.width=`${percent}%`;
    percentDiv.innerText=`${percent}%`;
    progressBar.style.transform=`scaleX(${percent/100})`
}

const onUploadSuccess=({file:url})=>{              //res.file ==={file} destructuring
    console.log("url "+url);
    fileInput.value="";
    emailForm[2].removeAttribute("disabled");
    progressContainer.style.display="none";
    sharingContainer.style.display="block";
    fileURL.value=url;
}

copyBtn.addEventListener("click",()=>{
    fileURL.select();
    document.execCommand("copy");
    showToast("Copied to ClipBoard");
});

emailForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    const url=fileURL.value;
    const formData={
        uuid:url.split("/").splice(-1,1)[0],
        emailTo:emailForm.elements["to-email"].value,
        emailFrom:emailForm.elements["from-email"].value
    }
    emailForm[2].setAttribute("disabled","true");
    //Using fetch to use API
    console.log(formData);
    fetch(emailURL,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(formData)
    }).then(res=>res.json()).then(({success})=>{
        if(success){
            sharingContainer.style.display="none";
            showToast("Email Sent");
        }
    })
});

let toastTimer;
const showToast=(msg)=>{
    toast.style.transform="translate(-50%,0)";
    clearTimeout(toastTimer)
    toastTimer=setTimeout(() => {
        toast.style.transform="translate(-50%,60px)";
    }, 2000);
}

