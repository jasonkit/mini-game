var Input = {
  state: {},
};

Input.get_state = function (identifier) {
  if (identifier in Input.state) {
    return Input.state[identifier];
  } else {
    return false;
  }
};

Input.handle_keydown = function (e) {
  Input.state[e.keyIdentifier] = true;

  var cust_handler = "handle_" + e.keyIdentifier + "_down";

  if ((cust_handler in Input) && (typeof Input[cust_handler] === "function")) {
    Input[cust_handler]();
  }
};

Input.handle_keyup = function (e) {
  Input.state[e.keyIdentifier] = false;

  var cust_handler = "handle_" + e.keyIdentifier + "_up";

  if ((cust_handler in Input) && (typeof Input[cust_handler] === "function")) {
    Input[cust_handler]();
  }
};

Input.init = function () {
  document.body.addEventListener("keydown", Input.handle_keydown);
  document.body.addEventListener("keyup", Input.handle_keyup);
};
