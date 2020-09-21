/*! Booking form */
window.onload=function()  {
	var pax = 0;
	for (var i = 8; i > pax; i--) {
		document.getElementById('pax-'+i).style.display="none";
	}
}
function checkPax() {
	var x = document.getElementById("myPax").value;

	if (isNaN(x)){ x = 0;}
	if (x > 8)   { x = 8;}
	if (x > 8 || x < 1){document.getElementById('mypax').style.color='red';}
	for (i = 1; i <= x; i++)    { document.getElementById('pax-'+i).style.display="block";}
	for (var i = 8; i > x; i--) { document.getElementById('pax-'+i).style.display="none" ;}
	};

	function getRadioVal(form, name) {
		var val;
    // get list of radio buttons with specified name
    var radios = form.elements[name];
    
    // loop through list of radio buttons
    for (var i=0, len=radios.length; i<len; i++) {
        if ( radios[i].checked ) { // radio checked?
            val = radios[i].value; // if so, hold its value in val
            break; // and break out of for loop
        }
    }
    return val; // return value of checked radio or undefined if none checked
}
function PaxSalutation( form ) { 
	var x = document.getElementById("salutation").selectedIndex;
	var y = document.getElementById("salutation").options;
	document.getElementById("salutation1").selectedIndex = y[x].index;
};
function PaxFirstname( form ) { 
	form.firstname.value = form.firstname.value[0].toUpperCase() + form.firstname.value.substring(1);
	form.firstname1.value = form.firstname.value;
};
function PaxLastname(  form ) { 
	form.lastname.value  = form.lastname.value[0].toUpperCase() + form.lastname.value.substring(1);
	form.lastname1.value  = form.lastname.value;
};
function checkToday(form){
  // id="arrdate" onChange="checkToday(this.form)"
  todaysDate  = new Date();
  arrDatestr  = form.arrdate.value;
  var arrDate = new Date(Date.parse(arrDatestr.replace(/-/g, " ")))
  if ( arrDate <= todaysDate){
  	alert('prior');
  	return true;
  }
  else {
  	alert(form.arrdate.value);
  	return false;
  }
};

const inputs = document.querySelectorAll("input, select, textarea");

inputs.forEach(input => {
  input.addEventListener(
    "invalid",
    event => {
      input.classList.add("error");
    },
    false
  );
});

input.addEventListener("blur", function() {
  input.checkValidity();
});