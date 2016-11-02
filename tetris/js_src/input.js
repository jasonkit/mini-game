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
  Input.state[e.key] = true;

  var key_handler = "handle_" + e.key + "_down";

  if ((key_handler in Input) && (typeof Input[key_handler] === "function")) {
    Input[key_handler]();
  }
};

Input.handle_keyup = function (e) {
  Input.state[e.key] = false;

  var key_handler = "handle_" + e.key + "_up";

  if ((key_handler in Input) && (typeof Input[key_handler] === "function")) {
    Input[key_handler]();
  }
};

Input.init = function () {
  document.body.addEventListener("keydown", Input.handle_keydown);
  document.body.addEventListener("keyup", Input.handle_keyup);
};
