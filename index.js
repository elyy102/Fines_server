import express from "express";
import { sql } from "./db.js";
import { register } from "./controllers/register.js";
import { auth } from "./controllers/auth.js";
import { roleMiddleware } from "./middlewares/roleMiddleware.js";
import cors from 'cors'
import multer from 'multer'
import path from "path"


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

app.get("/requests/", async (req, res) => {
    const data = await sql`select * from violations`
    res.send(data[0])
})

app.post("/add/", upload.single('image'), async (req, res) => {
    const image = req.file.filename
    const { violation_date, violation_place, car_number} = req.body
    console.log(image)
    const data = await sql`INSERT INTO violations(violation_date, violation_place, car_number, image) values(${violation_date}, ${violation_place}, ${car_number}, ${`http://localhost:3000/${image}`})`
    res.sendStatus(200)
})

//функция старта приложения
const start = async () => {

    //создаем таблицы
    await sql`create table if not exists Roles(
        role varchar(100) unique primary key
    )`

    //await sql`create table if not exists Statuses(
    //    status varchar(100) unique primary key
    //)`

    await sql`create table if not exists Users(
        id SERIAL PRIMARY KEY NOT NULL,
        name varchar(100) NOT NULL,
        role varchar(100),
        password varchar(100),
        FOREIGN KEY (role) REFERENCES Roles(role)
    )`

    await sql`CREATE TABLE IF NOT EXISTS violations (
        id SERIAL PRIMARY KEY,
        date_of_appeal DATE DEFAULT NOW(),
        violation_date DATE,
        violation_place VARCHAR(50),
        car_number VARCHAR(15),
        image varchar(100)
        )`

    //запустить в первый раз и больше не запускать
    //чтобы добавить роли в таблицу ролей

    //await sql`insert into Roles(role) values('USER')`
    //await sql`insert into Roles(role) values('ADMIN')`

    //await sql`insert into Statuses(status) values('Accepted')`
    //await sql`insert into Statuses(status) values('notAccepted')`

    //запустить сервак
    //(прослушивать порт на запросы)
    //вторым аргументом функция которая запустится при успешном запуске сервака



    app.listen(PORT, () => {
        console.log(`СЕРВАК ФУРЫЧИТ ТУТ http://localhost:${PORT}`);
    })
}

start()