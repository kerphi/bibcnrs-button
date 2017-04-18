//import {$,jQuery} from 'jquery';

console.log('Hello world !');

let a = {o: 1};
var x = Object.assign({}, a, {b: 1});

setTimeout(() => { console.log('My Timeout') }, 4000);

//console.log($(body).attr('id'));

var currentUrl = window.location.href;
console.log('HELLO FROM BACKGROUND', currentUrl)
