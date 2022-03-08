import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";  
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";


dotenv.config(); 

const app = express();

const PORT = process.env.PORT; 

app.use(cors());

app.use(express.json()); 

const MONGO_URL = process.env.MONGO_URL;

async function createConnection(){
    const client =  new MongoClient(MONGO_URL) 
    await client.connect();  
    console.log("Mongodb Connected");
    return client;
}

const client = await createConnection();


app.get("/",(request,response)=>{
    response.send("hello happy world");
});

app.get("/job", async (request,response)=>{
    const job = await client 
    .db("b28wd")
    .collection("job")
    .find({})
    .toArray();
    response.send(job);
});


app.post("/job", async (request,response)=>{
    const data = request.body;
    const result = await createJobs(data);
    response.send(result);
    });
    

    app.get("/job/:id", async (request,response)=>{
        console.log(request.params);
        const {id} = request.params;
        const job = await getJobsById(id)
        console.log(job);
    
        job? response.send(job) : response.status(404).send({message:"no matching found"});
    });
    
    app.delete("/job/:id", async (request,response)=>{
        console.log(request.params);
        const {id} = request.params;
        const result = await deleteJobsById(id)
        console.log(result);
    
        result.deletedCount>0? response.send(result) : response.status(404).send({message:"no matching found"});
    });
    
    app.put("/job/:id", async (request,response)=>{
        console.log(request.params);
        const {id} = request.params;
        const data = request.body;
        const result = await editJobsById(id, data);
        const movie = await getJobsById(id);
        console.log(result);
        response.send(movie);
    });
    
    async function editJobsById(id, data) {
        return await client
            .db("b28wd")
            .collection("job")
            .updateOne({ _id: ObjectId(id) }, { $set: data });
    }
    
    async function deleteJobsById(id) {
        return await client
            .db("b28wd")
            .collection("job")
            .deleteOne({ _id: ObjectId(id) });
    }
    
    async function createJobs(data) {
        return await client.db("b28wd").collection("job").insertOne(data);
    }
    
    async function getJobsById(id) {
        return await client
            .db("b28wd")
            .collection("job")
            .findOne({ _id: ObjectId(id) });
    }

    app.get("/user", async (request,response)=>{
        const job = await client 
        .db("b28wd")
        .collection("jobuser")
        .find({})
        .toArray();
        response.send(job);
    });
    
    
    app.post("/user", async (request,response)=>{
        const data = request.body;
        const result = await createJobUser(data);
        response.send(result);
        });

        async function createJobUser(data) {
            return await client.db("b28wd").collection("jobuser").insertOne(data);
        }

        app.get("/user/:id", async (request,response)=>{
            console.log(request.params);
            const {id} = request.params;
            const job = await getUserById(id)
            console.log(job);
        
            job? response.send(job) : response.status(404).send({message:"no matching found"});
        });

        app.put("/user/:id", async (request,response)=>{
            console.log(request.params);
            const {id} = request.params;
            const data = request.body;
            const result = await editJobsUserById(id, data);
            const movie = await getUserById(id);
            console.log(result);
            response.send(movie);
        });
        
        async function editJobsUserById(id, data) {
            return await client
                .db("b28wd")
                .collection("jobuser")
                .updateOne({ _id: ObjectId(id) }, { $set: data });
        }

        async function getUserById(id) {
            return await client
                .db("b28wd")
                .collection("jobuser")
                .findOne({ _id: ObjectId(id) });
        }


        app.get("/joblist", async (request,response)=>{
            const job = await client 
            .db("b28wd")
            .collection("joblist")
            .find({})
            .toArray();
            response.send(job);
        });
        
        
        app.post("/joblist", async (request,response)=>{
            const data = request.body;
            const result = await createJobsList(data);
            response.send(result);
            });
    
            async function createJobsList(data) {
                return await client.db("b28wd").collection("joblist").insertOne(data);
            }




            async function createUser(data) {
                return await client.db("b28wd").collection("password").insertOne(data);
            }
            
            async function getUserByName(email) {
                return await client
                    .db("b28wd")
                    .collection("password")
                    .findOne({ email: email });
            }
            
            
            
            async function genPassword(password){
                const NO_OF_ROUNDS = 10;
                const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
                console.log(salt);
                const hashedPassword = await bcrypt.hash(password, salt);
                console.log(hashedPassword);
                return hashedPassword;
            }
            
            
            app.post("/signup", async (request,response)=>{
                const {email, password} = request.body;
                const userFromDB = await getUserByName(email);
            console.log(userFromDB);
            
            if(userFromDB){
                response.status(400).send({message: "username already exists"});
              
                return;
            }
            
            if(password.length < 8){
                response.status(400).send({message: "password must be longer"});
               
                return;
            }
                const hashedPassword = await genPassword(password); 
                const result = await createUser({ email, password:hashedPassword });
                response.send(result);   
                });
            
            app.post("/login", async (request,response)=>{
                const {email, password} = request.body;
                const userFromDB = await getUserByName(email);
            
                if(!userFromDB){
                    response.send({message: "Invalid Credentials"});
                   
                    return;
                }
            
                const storedPassword = userFromDB.password;
                console.log(storedPassword);
            
                const isPasswordMatch = await bcrypt.compare(password, storedPassword);
            
                console.log(isPasswordMatch);
                console.log(userFromDB);
            
                if (isPasswordMatch) {
                    
                    response.send({message: "sucessful login"});
                }else{
                    response.status(401).send({message: "Invalid Credentials"});
              
                }
            
                
            });


    app.listen(PORT,()=>console.log("app is started in",PORT));



