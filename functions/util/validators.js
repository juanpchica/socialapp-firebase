const isEmail = (email) => {
  const regEx =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

exports.validateSignupData = ({ email, password, confirmPassword, handle }) => {
  // Validate user data
  const errors = {};

  if (isEmpty(email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(email)) {
    errors.email = "Email is not valid";
  }

  if (isEmpty(password)) errors.password = "Must not be empty";
  if (password !== confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (isEmpty(handle)) errors.handle = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateLoginData = (user) => {
  // Validate user data
  const errors = {};
  if (isEmpty(user.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(user.email)) {
    errors.email = "Email is not valid";
  }

  if (isEmpty(user.password)) errors.password = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.reduceUserDetails = (data) => {
  let userDetails = {};

  if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
  if (!isEmpty(data.website.trim())) {
    // https://website.com
    if (data.website.trim().substring(0, 4) !== "http") {
      userDetails.website = `http://${data.website.trim()}`;
    } else userDetails.website = data.website;
  }
  if (!isEmpty(data.location.trim())) userDetails.location = data.location;

  return userDetails;
};
