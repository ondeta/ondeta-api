# OndeTá API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

### Descrição

Backend da plataforma **OndeTá**, desenvolvido com **NestJS**, **Prisma ORM** e **PostgreSQL**, responsável pelo gerenciamento de autenticação, usuários, empresas, veículos, serviços e solicitações.

A API fornece todos os recursos necessários para o aplicativo móvel, implementando autenticação via Firebase, controle de permissões, gerenciamento empresarial e documentação automática utilizando Swagger.

### Tecnologias

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL (Neon compatível)
- Firebase Admin SDK
- Swagger/OpenAPI
- Docker Compose
- Axios
- Cache Manager
- Class Validator
- Class Transformer

### Arquitetura

O projeto segue uma arquitetura modular baseada em recursos (feature-based architecture), aproveitando o sistema de módulos do NestJS.

```
Cliente
      │
      ▼
Controllers
      │
      ▼
Services
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
```

Além disso, existem módulos compartilhados responsáveis por autenticação, banco de dados, configuração e utilitários comuns.

### Estrutura do Projeto

```
src/

├── app.module.ts

├── common/
│   ├── decorators
│   ├── filters
│   ├── guards
│   ├── interceptors
│   └── pipes

├── config/

├── database/

├── firebase/

├── shared/

└── modules/

    ├── auth
    ├── users
    ├── user-addresses
    ├── companies
    ├── memberships
    ├── company_services
    ├── vehicles
    ├── vehicle-locations
    ├── service-requests
    ├── demand-analytics
    └── account-type
```

### Funcionalidades

#### Autenticação

- Login via Firebase
- Validação de ID Token
- Controle de acesso
- Guards de autenticação
- Integração com Firebase Admin

#### Usuários

- Cadastro
- Consulta
- Atualização
- Exclusão
- Perfil

#### Endereços

Cada usuário pode possuir múltiplos endereços.

Recursos:

- cadastro
- edição
- remoção
- endereço padrão

#### Empresas

- Cadastro de empresas
- Atualização
- Exclusão
- Consulta

#### Membros

Controle de participação dos usuários nas empresas.

Permissões como:

- Owner
- Admin
- Member

#### Serviços

Gerenciamento dos serviços oferecidos pelas empresas.

Inclui:

- cadastro
- edição
- listagem
- remoção

#### Veículos

Empresas podem cadastrar seus veículos para utilização durante a prestação dos serviços.

#### Localização dos veículos

Registro da localização dos veículos.

Preparado para integração com dispositivos IoT.

#### Solicitações de Serviço

Clientes podem solicitar serviços.

Empresas podem:

- visualizar
- aceitar
- acompanhar
- finalizar

#### Analytics

Módulo responsável por estatísticas e métricas relacionadas às solicitações de serviço.

### Banco de Dados

O projeto utiliza **Prisma ORM**.

Existe documentação do banco em:

```
docs/dbdiagram/
```

Além disso, o projeto possui:

```
prisma/schema.prisma
```

como fonte principal do modelo de dados.

### Principais Entidades

- Users
- UserAddresses
- Companies
- Memberships
- CompanyServices
- Vehicles
- VehicleLocations
- ServiceRequests

### Segurança

A API implementa diversas camadas de segurança.

Entre elas:

- Firebase Authentication
- Guards
- Decorators personalizados
- Validação de DTOs
- Pipes
- Interceptors
- Exception Filters

### Documentação da API

O projeto utiliza:

- Swagger

A documentação é gerada automaticamente a partir dos decorators do NestJS.

Após iniciar o projeto, normalmente estará disponível em:

```
/api
```

### Configuração

#### Variáveis de Ambiente

O projeto possui:

```
.env.example
```

As principais configurações incluem:

- Banco PostgreSQL
- Firebase
- Porta da aplicação
- Ambiente
- Cache

### Instalação

#### Clonar

```bash
git clone https://github.com/ondeta/ondeta-api.git
```

#### Instalar dependências

```bash
npm install
```

#### Configurar ambiente

```bash
cp .env.example .env
```

Editar as variáveis necessárias.

#### Executar

Modo desenvolvimento

```bash
npm run start:dev
```

Produção

```bash
npm run start:prod
```

Build

```bash
npm run build
```

### Docker

O projeto possui:

```
docker-compose.yml
```

facilitando a execução do ambiente de desenvolvimento.

### Testes

O projeto possui suporte aos testes do NestJS.

Scripts disponíveis:

```bash
npm run test
```

```bash
npm run test:watch
```

```bash
npm run test:cov
```

```bash
npm run test:e2e
```

### Organização dos Módulos

Cada módulo segue o padrão do NestJS:

```
module/

controllers/
services/
dto/
entities/
interfaces/
repositories/
module.ts
```

Essa organização favorece escalabilidade e manutenção.

### Fluxo Geral

```
App Mobile
        │
        ▼
Firebase Authentication
        │
        ▼
NestJS API
        │
        ▼
Guards
        │
        ▼
Controllers
        │
        ▼
Services
        │
        ▼
Prisma ORM
        │
        ▼
PostgreSQL
```

# Licença

Projeto desenvolvido para a plataforma **OndeTá**, destinada à intermediação entre clientes e prestadores de serviços, oferecendo gerenciamento de empresas, veículos, solicitações e localização em tempo real.
