const queries = [
  {
    name: 'login',
    description: 'Authenticate user with username and password',
    query: `
      SELECT
          u.idUser,
          u.email,
          u.name,
          crypt($2, p.password) = p.password AS ispassok
      FROM users u
      INNER JOIN passwords p ON u.idUser = p.idUser
      WHERE u.email = $1
      ORDER BY p.id DESC
      LIMIT 1
      ;
    `
  },
  {
    name: 'create_user',
    description: 'Create a new user',
    query: `
      INSERT INTO users("user", rol, name, lastname, email) VALUES ($1, $2, $3, $4, $5);
    `
  },
  {
    name: 'get_id_user_created',
    description: 'Obtiene el id del usuario recién creado',
    query: `
      SELECT idUser FROM users WHERE name = $1;
    `
  },
  {
    name: 'create_password',
    description: 'Create a new password',
    query: `
      INSERT INTO passwords (idUser, password, countFail) VALUES ($1, crypt($2, gen_salt('md5')), $3);
    `
  },
  {
    name: 'verify_created_password',
    description: 'Verifica que se pudo crear la contraseña del nuevo usuario',
    query: `
      SELECT iduser FROM passwords WHERE iduser = $1;
    `
  },
  {
    name: 'create_access_server',
    description: 'Create a new access server',
    query: `  
      INSERT INTO access (idUser, typeAccess, ip) VALUES ($1, $2, $3);
    `
  },
  {
    name: 'create_token',
    description: 'Create a new token',
    query: `
      INSERT INTO tokens (idUser, token) VALUES ($1, $2);
    `
  },
  {
    name: 'get_token',
    description: 'Get a token',
    query: `
      SELECT * FROM tokens WHERE idUser = $1;
    `
  }
];

module.exports = queries;
