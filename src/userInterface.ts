import {Controller} from "./controller";
//import * as THREE from 'three';

export class UserInterface {
    
    start(c: Controller) {
        
      

        var container = <HTMLDivElement>document.querySelector('#app');
        const sim_menu = <HTMLDivElement>document.querySelector('#sim-menu');
        const sim_Button = document.getElementById('sim-button');
        const free_drive_Button = document.getElementById('free-drive-button');
        //var infoHtmlElement = <HTMLDivElement>document.querySelector('#info');
        
        var w = container.clientWidth, h = container.clientHeight;

        var renderer =  c.getRenderer();
        container?.appendChild(renderer.domElement);

        /*window.addEventListener('resize', function () {
            w = container?.clientHeight;
            h = container?.clientHeight;
            c.updateCamera(w, h);
            renderer.setSize(w, h);
        })*/
        function navigate(e: KeyboardEvent) {
            c.navigate(e.keyCode);
        } 
          
        //Window Event Listener (Triggers)
        window.addEventListener('keydown', navigate);
        window.addEventListener('keyup', navigate);

        c.simulation(w,h);
        if(free_drive_Button){
            free_drive_Button.addEventListener('click', function (){ 
                c.simulation(w,h);
                sim_menu.classList.add('hidden');});
            }
    
            if(sim_Button){
            sim_Button.addEventListener('click', function (){ 
                c.simulation(w,h);
                sim_menu.classList.add('hidden');});
            }

        //c.start();
    }
    
    
}
