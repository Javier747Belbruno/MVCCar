import {Controller} from "./controller";
//import * as THREE from 'three';

export class UserInterface {
    
    container = <HTMLDivElement>document.querySelector('#app');
    sim_menu = <HTMLElement>document.querySelector('#sim-menu');
    sim_Button = <HTMLElement>document.getElementById('sim-button');
    free_drive_Button = <HTMLElement>document.getElementById('free-drive-button');
    infoHtmlElement = <HTMLDivElement>document.querySelector('#info');

    start(c: Controller) {
    
        
        var w = this.container.clientWidth, h = this.container.clientHeight;

        var renderer =  c.getRenderer();
        this.container?.appendChild(renderer.domElement);

        /*window.addEventListener('resize', function () {
            w = container?.clientHeight;
            h = container?.clientHeight;
            c.updateCamera(w, h);
            renderer.setSize(w, h);
        })*/
        function navigate(e: KeyboardEvent) {
            c.navigate(e);
        } 
          
        //Window Event Listener (Triggers)
        window.addEventListener('keydown', navigate);
        window.addEventListener('keyup', navigate);

        c.simulation(w,h);
        if(this.free_drive_Button){
            this.sim_menu.classList.add('hidden');
            this.free_drive_Button.addEventListener('click', function (){ 
                c.simulation(w,h);});
                
            }
    
            if(this.sim_Button){
                this.sim_menu.classList.add('hidden');
                this.sim_Button.addEventListener('click', function (){ 
                c.simulation(w,h);
                });
            }

    }
    
    
}
