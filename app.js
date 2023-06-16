const { rename } = require("fs");
const fs = require("fs/promises");

(async  () => {

    //Functions - create
    const createFile = async(path) => {
        let existingFileCheck;
        try{
            
            //Will check if file exists
            existingFileCheck = await fs.open(path, "r")
            existingFileCheck.close();
            return console.log(`The file "${path}" already exists.`)
        
        //Will give error if file doesn't exist due to flag "r"
        } catch(e){
            
            //Will create file if doesn't exist due to flag "w"
            const newFile = await fs.open(path, "w")
            newFile.close();

        }

    }

    //Functions - delete
    const deleteFile = async(path) => {
        try{

            //Will check if file exists
            await fs.unlink(path);
            return console.log(`File - "${path}" removed.`)
        
        //Will give error if file doesn't exist due to flag "r"
        } catch(e){
            if(e.code === "ENOENT")
                console.log(`File - "${path}" doesn't exist`)
            else 
                console.log(`There has been an unexpected error - "${e}"`);
        }
    }

    //Functions - rename
    const renameFile = async(oldPath, newPath) => {
        try{

            //Rename and check if file exist
            await fs.rename(oldPath, newPath)
            return console.log(`The file - "${oldPath}" has been renamed to - "${newPath}"`);
        
        } catch(e){
        
            //If file doesn't exist
            if(e.code === "ENOENT")
                console.log(`The file - "${oldPath}" doesn't exist, or destination doesn't exist.`);
            else
                console.log(`There has been some error - \n${e}`);
        }
    }

    //Function - addTo
    const addTo = async(path, data) => {
        try{

            //Append to file and will create new file if one doesnt exist
            await fs.appendFile(path, data)
            console.log(`The file - "${path}" has been appended.`);

        } catch(e){

            //If file doesn't exist
            if(e.code === "ENOENT")
                console.log(`The file - "${path}" doesn't exist.`);
            else
                console.log(`There has been some error - \n${e}`);

        }
    }

    //Commands
    const CREATE_FILE = "create a file";
    const DELETE_FILE = "delete file";
    const RENAME_FILE = "rename";
    const ADD_TO = "add";

        //Flag because 'change' event is fired when the file is opened and at that time 'buff' is empty
        let isFirstChange = true;

        //Opening a file and saving its file descriptor in a variable for file handling later.
        const tempCommandFile = await fs.open("./command.txt", "r");

        //Event handler for change
        tempCommandFile.on("change", async() => {
            const size = (await tempCommandFile.stat()).size;
            const buff = Buffer.alloc(size);

            //Using the file descriptor to read the file
            await tempCommandFile.read(buff, 0, size, 0);
            
            const command = buff.toString();

            //Getting the file path from command
            if(command.includes(CREATE_FILE)){
                const location = command.substring(CREATE_FILE.length+1);
                await createFile(location);
            } else if(command.includes(DELETE_FILE)){
                const location = command.substring(DELETE_FILE.length+1);
                await deleteFile(location);
            } else if(command.includes(RENAME_FILE) && command.includes(" to ")){
                let temp = command.indexOf(" to ");
                const location1 = command.substring(RENAME_FILE.length+1, temp);
                const location2 = command.substring(temp+4);
                await renameFile(location1, location2);
            } else if(command.includes(ADD_TO) && command.includes(" to ")){
                let temp = command.indexOf(" to ");
                const location = command.substring(temp+4);
                const data = command.substring(ADD_TO.length+1, temp);
                await addTo(location, data);
            }
        })

        //File watching starts
        const watcher = fs.watch("./command.txt")

        for await (const event of watcher){
            if(event.eventType === "change"){
                if(isFirstChange){
                    isFirstChange = false
                    continue;
                }   
                tempCommandFile.emit("change");
            }
        }
})();