const url_personaje = 'https://gameinfo.albiononline.com/api/gameinfo/search?q=Pelotuda'

const Index = () => {
 
    let data = async () =>{
        fetch(url_personaje).then((d)=>{
            console.log(d)
        })
    }
    

  return (
    <div>
        {data}
    </div>
  )
};

export default Index;