export class Driver {
    id: string;
    public name: string;
    public gender: string;
    public age: number;
    public licenceYears: number;
    public coverage: string;
    public insurancePremium: number;
    
    constructor(name:string="",gender:string="",age:number = 18,licenceYears:number=1,coverage:string="Full"){
        this.name = name;
        this.gender = gender;
        this.age = age;
        this.licenceYears = licenceYears;
        this.coverage = coverage;
    }
/*
    constructor(id:y) {
        this.id = id;
        this.name = name;
        this.gender = gender;
        this.dob = dob;
        this.licenceDate = licenseData;
    }
    */
}
