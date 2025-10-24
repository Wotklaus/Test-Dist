class UserDTO {
  constructor({ id, first_name, last_name, document_id, phone, email, password, registration_date }) {
    this.id = id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.document_id = document_id;
    this.phone = phone;
    this.email = email;
    this.password = password;
    this.registration_date = registration_date;
  }
}

module.exports = UserDTO;