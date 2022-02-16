
let adds;
let id = Math.floor(Math.random() * 3) + 1;

$.ajax({
  url: `/getAd/`,
  type: 'GET',
  data: {'screen': id},
  success: function(res) {
      adds = res;
  },
  error: function(res){
      console.error(res)
  }
});

const reset = (rows, images) => {
    rows.forEach(item => item.innerText = '');
    images.forEach(image => image.src = '');
}

const checkIfDateIsValid = (item) => {
    const now = new Date();
    let isValidDate = false;
    let isValidDay = false;
    let isValidHour = false;

    if(now.getTime() > item.calender.date[0] && now.getTime() < item.calender.date[1]) isValidDate = true;
    isValidDay = item.calender.days.includes(now.getDay())  
    if(now.getHours() >= item.calender.hours[0] && now.getHours() <= item.calender.hours[1]) isValidHour = true;


    return isValidDate && isValidDay && isValidHour;
}


$(document).ready(function(){
    let index = 0;
    const rows = document.querySelectorAll('.row');
    const images = document.querySelectorAll('.image')
    setInterval(()=>{
        reset(rows, images);
        
        const { template, text_lines, Pictures} = adds[index];
        document.querySelector('.card-holder').className = 'card-holder ' + 'card' + template + " mb-3";
        document.querySelector('.images-container').className = 'images-container ' + 'images-' + template;
        document.querySelector('.texts-container').className = 'texts-container ' + 'text-fields-' + template;
        text_lines.map((text,index) => { 
            rows[index].innerText = text;
        });
        Pictures.map((imgUrl,index) => { 
            images[index].src = imgUrl;
        });
        index = (index + 1) % adds.length;
    },5000); 

})
