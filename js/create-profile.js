<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Create Profile - RHK</title>

<link rel="preconnect" href="https://fonts.googleapis.com">

<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

<link rel="stylesheet" href="css/style.css">

<style>

body{
background:#f8fafc;
display:flex;
justify-content:center;
align-items:center;
min-height:100vh;
padding:20px;
}

.profile-card{

width:100%;
max-width:420px;

background:#fff;

padding:30px;

border-radius:25px;

box-shadow:0 15px 40px rgba(0,0,0,.08);

}

.title{

text-align:center;

margin-bottom:25px;

}

.title h1{

font-size:30px;

font-weight:700;

color:#111827;

}

.title p{

margin-top:6px;

color:#6b7280;

}

.image-area{

display:flex;

justify-content:center;

margin-bottom:25px;

}

.image-box{

width:140px;

height:140px;

border-radius:50%;

background:#eef2ff;

border:3px dashed #2563eb;

display:flex;

justify-content:center;

align-items:center;

overflow:hidden;

cursor:pointer;

}

.image-box img{

width:100%;

height:100%;

object-fit:cover;

display:none;

}

.image-box span{

font-size:14px;

color:#2563eb;

text-align:center;

padding:10px;

}

input[type=file]{

display:none;

}

.form-group{

margin-bottom:20px;

}

.form-group label{

display:block;

margin-bottom:8px;

font-weight:600;

}

.form-group input{

width:100%;

height:55px;

border:1px solid #d1d5db;

border-radius:15px;

padding:0 15px;

font-size:15px;

outline:none;

}

.form-group textarea{

width:100%;

height:120px;

border:1px solid #d1d5db;

border-radius:15px;

padding:15px;

resize:none;

font-size:15px;

outline:none;

}

.form-group input:focus,
.form-group textarea:focus{

border-color:#2563eb;

}

.saveBtn{

width:100%;

height:55px;

border:none;

border-radius:15px;

background:#2563eb;

color:white;

font-size:17px;

font-weight:600;

cursor:pointer;

transition:.25s;

}

.saveBtn:hover{

background:#1d4ed8;

}

#message{

margin-top:15px;

text-align:center;

font-size:14px;

color:#ef4444;

}

</style>

</head>

<body>

<div class="profile-card">

<div class="title">

<h1>Create Profile</h1>

<p>Complete your RHK profile</p>

</div>

<div class="image-area">

<label class="image-box" for="profileImage">

<img id="preview">

<span id="uploadText">

Choose Photo

</span>

</label>

<input
type="file"
id="profileImage"
accept="image/*">

</div>

<form id="profileForm">

<div class="form-group">

<label>Username</label>

<input
type="text"
id="username"
placeholder="Choose a username"
required>

</div>

<div class="form-group">

<label>Bio</label>

<textarea
id="bio"
placeholder="Tell people about yourself..."></textarea>

</div>

<button
type="submit"
class="saveBtn"
id="saveBtn">

Save Profile

</button>

</form>

<p id="message"></p>

</div>

<script>

const imageInput=document.getElementById("profileImage");

const preview=document.getElementById("preview");

const uploadText=document.getElementById("uploadText");

imageInput.onchange=()=>{

const file=imageInput.files[0];

if(!file)return;

preview.src=URL.createObjectURL(file);

preview.style.display="block";

uploadText.style.display="none";

};

</script>

<script type="module" src="js/create-profile.js"></script>

</body>

</html>
