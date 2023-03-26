/*Karena Qian
Professor Carlos Arias
Gale-Shapley Algorithm Implementation
Last Modified: January 14, 2023
This program takes in a file input from the console containing an ordered list of men and women, each with thier list of preferences, and outputs a list of pairings based on the preferences using the Gale-Shapley Stable Matching Algorithm.
Example required file format:
Man1 1 5 2 3 4
Man2 5 2 3 1 4
...
END
Woman1 5 3 4 2 1
Woman2 3 2 4 1 5
...
END*/

const fs = require("fs"); //for reading file
const readline = require("readline").createInterface({ //for reading user input from console
    input: process.stdin,
    output: process.stdout
});

//Person class - representing a man or a woman
//Contains a man or a woman's name, preference list, their current partner, and their current partner choice
//Contains operations for getting/setting variables, comparing partners, removing from the preference list, and checking if preference list is empty.
class Person{
    constructor(name, list, partner){
        this.name = name; //name of Person
        this.list = list; //preference list of Person
        this.partner = partner; //current partner of Person, -1 if none
        this.choice = 0; //index of Person's currrent partner choice, -1 if Person has no more choices
    }
    //getName - gets name of Person
    //Params: none
    //Returns: name of Person
    getName(){
        return this.name;
    }
    //getList - gets preference list of Person
    //Params: none
    //Returns: list of Person
    getList(){
        return this.list;
    }
    //getPartner - gets partner of Person
    //Params: none
    //Returns: partner of Person
    getPartner(){
        return this.partner;
    }
    //getChoice - gets partner choice of Person
    //Params: none
    //Returns: choice of Person
    getChoice(){
        return this.choice;
    }
    //setName - sets name of Person
    //Params: name (string to set Person name to)
    //Returns: nothing
    setName(name){
        this.name = name;
    }
    //setList - sets preference list of Person
    //Params: list (preference list to set Person list to)
    //Returns: nothing
    setList(list){
        this.list = list;
    }
    //setPartner - sets partner of Person
    //Params: partner (partner value to set Person partner to)
    //Returns: nothing
    setPartner(partner){
        this.partner = partner;
    }
    //setChoice - sets partner choice of Person
    //Params: choice (choice value to set Person choice to)
    //Returns: nothing
    setChoice(choice){
        if(choice < this.list.length){
            this.choice = choice;
        }
        else{
            this.choice = -1;
        }
    }
    //setChoicePartner - sets both partner and the choice index of the partner
    //Params: partner (partner value to set Person partner to and to get the choice index from)
    //Returns: nothing
    setChoicePartner(partner){
        this.partner = partner;
        if(partner != -1){
            this.choice = this.list.indexOf(partner);
        }
    }
    //getFirstChoice - gets partner from preference at Person's current choice
    //Params: none
    //Returns: current partner choice from list
    getCurrChoice(){
        return this.list[this.choice];
    }
    //comparePartners - compares and returns a partner that is higher than the current partner choice in Person's preference list
    //Params: newPartner (partner to compare current partner choice with)
    //Returns: partner located to the left of the other in Person's list
    comparePartners(newPartner){
        // console.log(index);
        if(this.choice > this.list.indexOf(newPartner)){
            return newPartner;
        }
        else{
            return this.getCurrChoice();
        }
    }
}

//gSAlgorithm - JavaScript implementation of Gale-Shapley Stable Matching Algorithm
//It returns a list representing the partners of the men, each position aligned with each man's position within men list
//Each slot holds a integer, representing the woman of the man as the position of the slot
//Women are represented by their positions within women list
//Params: men (list of free men) women (list of free women)
//Returns: list of the partners of the men
//Ex: info in input.txt must return [0, 2, 1, 4, 3]
//Victor (position 0 in list & men) is paired with Amy (position 0 in women)
//Wyatt (position 1 in list & men) is paired with Clare (position 2 in women)
//etc.

//Time Complexity: (2m+(C-1))*(2n+m+8) + 5 = 4mn + 2(C-1)n + 2m^2 + (C-1)m + 16m + 8(C-1) + 5 
//= 2m^2 + (4n + (C-1) + 16)m + 2(C-1)(n + 4) + 5 = O(m^2): quadratic time complexity (worst case)
//Space Complexity: m = O(m): linear space complexity
//Variables: m = size of men list, n = size of a man/woman's preference list, C = arbitrary constant
function gSAlgorithm(men, women){
    //edge case: men and/or women lists are empty
    if(men.length == 0 || women.length == 0){
        return null; //nothing to do
    }
    let list = []; //1 time, m space
    //initialize list
    for(let i = 0; i < men.length; i++){ //m times
        list.push(-1); //1 time
    }
    //get first man
    let manNum = 0; //1 time, 1 space
    while(manNum != -1){//m + C times
        //check if current man ran out of choices
        if(men[manNum].getChoice() == -1){ //1 time
            list[manNum] = -2; //set man's slot to -2 to indicate that he has no more choices and is unpaired, 1 time
        }
        else{//worst case
            //get current woman choice on man's preference list
            let womanNum = men[manNum].getCurrChoice(); //1 time, 1 space
            //if woman has no partner
            if(women[womanNum].getPartner() == -1){ //1 time
                //pair up current man and woman
                list[manNum] = womanNum; //set current man's slot to woman, 1 time
                women[womanNum].setChoicePartner(manNum); //set both woman's partner and choice, n times
                men[manNum].setPartner(womanNum); //set current man's partner, 1 time
            }
            else{//worst case
                //if woman prefers current man over her partner (worst case)
                if(women[womanNum].comparePartners(manNum) == manNum){ //n times
                    //get woman's ex partner
                    let womanPartner = women[womanNum].getPartner(); //1 time, 1 space

                    //pair up current man and woman
                    list[manNum] = womanNum; //1 time
                    women[womanNum].setChoicePartner(manNum); //n times
                    men[manNum].setPartner(womanNum); //1 time

                    //reset woman's ex partner's partner and move his choice to next woman in his list
                    men[womanPartner].setPartner(-1); //1 time
                    men[womanPartner].setChoice(men[womanPartner].getChoice() + 1); //1 time
                    list[womanPartner] = -1; //1 time
                }
                else{
                    //move current man's choice to next woman in his list
                    men[manNum].setChoice(men[manNum].getChoice() + 1); //1 time
                }
            }   
        }
        //get next available man
        manNum = list.indexOf(-1);//m times
    }
    return list; //1 time
}

//getPerson - Creates a Person from arr representing a row in input file
//Params: arr (array containing Person name and preference list)
//Returns: new Person object containing info from arr
function getPerson(arr){
    let name = arr.shift();
    let list = arr.map((x)=>{
        return parseInt(x, 10);
    });
    let result = new Person(name, list, -1);
    return result;
}

//Main Function for getting file input and running + testing G-S Algorithm Implementation
//Example Console Output: 
//  Input a file name: classexample.txt
//  Victor paired with Amy
//  Wyatt paired with Clare
//  Xavier paired with Bertha
//  Yancey paired with Erika
//  Zeus paired with Diane
readline.question('Input a file name: ', name => {
    fs.readFile(name, (err, data) => {
        if(err){ //for incorrect file input
            return console.error(err);
        }
        //extract and organize data from file
        let str = data.toString();
        let arr = str.split("\r\n");        
        let men = [];
        let women = [];
        let currArr = men;
        for(person of arr){
            if(person == 'END'){
                currArr = women;
            }
            else{
                let p = person.split(" ");
                currArr.push(getPerson(p));
            }
        }
        //run G-S algorithm and output results into console
        let finalList = gSAlgorithm(men, women);
        //edge case: no men and/or women to be found in file
        if(finalList == null){ 
            console.log("Empty list(s) found");
        }
        else{
        let index = 0;
            for (woman of finalList){
                if(woman != -2){
                    console.log(`${men[index].getName()} paired with ${women[woman].getName()}`);
                }else{
                    console.log(`${men[index].getName()} is not paired`);
                }
                index += 1;
            }
        }
    });
    readline.close();
});