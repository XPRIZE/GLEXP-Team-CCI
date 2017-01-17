/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function openURL(url) {
    if (device.platform === 'Android') {
	navigator.app.loadUrl(url, {openExternal: true});
    } else {
	window.open(url, '_system');
    }
}