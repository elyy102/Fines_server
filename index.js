import express from "express";
import { sql } from "./db.js";
import { register } from "./controllers/register.js";
import { auth } from "./controllers/auth.js";
import { roleMiddleware } from "./middlewares/roleMiddleware.js";
import cors from 'cors'
import multer from 'multer'
import path from "path"
import jwt from 'jsonwebtoken'


//порт на котором будет работать сервер
const PORT = 3000

//сама переменная сервера
const app = express()

//чтобы сервер понимал json
app.use(express.json())
app.use(cors())
app.use(express.static('uploads'));

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    }
  })
  
var upload = multer({ storage: storage })


app.get('/', roleMiddleware(["ADMIN"]), async (req, res) => {
    const data = await sql`select * from Users`
    res.send(data)
})

//ветка регистрации
app.post('/reg', register)
//ветка логина
app.post('/auth', auth)

app.get("/requests/", roleMiddleware(['USER']), async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const {id} = jwt.verify(token, "SECRET_KEY")
    const data = await sql`select * from violations where fk_user = ${id}`
    res.send(data)
})

app.get("/undone_requests/", async (req, res) => {
    const data = await sql`select * from violations where (status is null)`
    res.send(data)
})

app.get("/done_requests/", async (req, res) => {
    const data = await sql`select * from violations where (status is not null)`
    res.send(data)
})

app.post("/add/", roleMiddleware(['USER']),upload.single('image'), async (req, res) => {
    const image = req.file.filename
    const { violation_date, violation_place, car_number} = req.body
    console.log(image)
    console.log(req.headers.authorization);
    const token = req.headers.authorization.split(' ')[1]
    const {id} = jwt.verify(token, "SECRET_KEY")
    const data = await sql`INSERT INTO violations(violation_date, violation_place, car_number, image, fk_user) values(${violation_date}, ${violation_place}, ${car_number}, ${`http://localhost:3000/${image}`}, ${id})`
    res.sendStatus(200)
})


//функция старта приложения
const start = async () => {

    //создаем таблицы
    await sql`create table if not exists Roles(
        role varchar(100) unique primary key
    )`

    await sql`create table if not exists Users(
        id SERIAL PRIMARY KEY NOT NULL,
        name varchar(100) NOT NULL,
        role varchar(100),
        password varchar(100),
        FOREIGN KEY (role) REFERENCES Roles(role)
    )`

    await sql`CREATE TABLE IF NOT EXISTS violations (
        violation_id SERIAL PRIMARY KEY,
        date_of_appeal DATE DEFAULT NOW(),
        violation_date DATE,
        violation_place VARCHAR(50),
        car_number VARCHAR(15),
        image varchar(100),
        status varchar(15),
        fk_user INTEGER REFERENCES users(id)
        )`

    //запустить в первый раз и больше не запускать
    //чтобы добавить роли в таблицу ролей

    //await sql`insert into Roles(role) values('USER')`
    //await sql`insert into Roles(role) values('ADMIN')`

    //запустить сервак
    //(прослушивать порт на запросы)
    //вторым аргументом функция которая запустится при успешном запуске сервака



    app.listen(PORT, () => {
        console.log(`СЕРВАК ФУРЫЧИТ ТУТ http://localhost:${PORT}`);
    })
}

start()