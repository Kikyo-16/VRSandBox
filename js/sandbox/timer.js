export function CreateTimer(){

    let timer = new Map()

    this.newTime = () =>{
        return (new Date()).getTime();
    }
    this.register = (tags) =>{
        this.tags = tags;
        for(let i = 0; i < tags.length; ++i){
            timer.set(tags[i], -1)
        }
    }
    this.reset = () =>{
        this.register(this.tags);
    }

    this.update = (tag) =>{
        timer.set(tag, this.newTime())
        return this.get(tag);
    }
    this.set = (tag, time) =>{
        let cur = this.get(tag);
        if(cur < time)
            timer.set(tag, time)
        return this.get(tag);
    }
    this.get = (tag)=>{
        return timer.get(tag);
    }
}