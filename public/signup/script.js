$(function () {
  $("#loginButton").on("click", login);

});

function login() {
  const $message = $('#message');

  let username = $("#userarea").val();
  let userpassword = $("#passwordarea").val();
  let fName = $("#fname").val();
  let lName = $("#lname").val();
  let email = $("#email").val();
  let data = { 
    "user": username,
    "password": userpassword ,
    "fName": fName,
    "lName": lName,
    "email": email
  };

  $.ajax({
    url: 'http://localhost:3000/users',
    type: 'POST',
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function (data) {
      // nothing ever happens here :/
      window.location = 'index.html';
    },
    error: function (data) {
      // I HAVE NO IDEA WHY IT GETS HERE EVEN WHEN THE POST IS SUCCESSFUL   
      // ------------------- ERROR SPOTTED: -----------------------------
      // IT IS NOT ABLE TO VERIFY THE PASSWORD, ONLY THE USERNAME
      console.log(data.status);
      if (data.status == 201) {
        $message.html('<span class="has-text-success">Success! You have signed up successfully.</span>');
        setTimeout(function () {
          window.location = '/login/index.html';
        }, 2000);
      } else {
        console.log(data);
        $message.html(`<span class="has-text-danger">Something went wrong and you were not logged in. We got the error "${data.responseText}"  :(</span>`);

      }
    }
  });
}

