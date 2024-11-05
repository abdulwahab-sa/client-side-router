import React from "react";


type ListenerFunction = (arg:string) => void


export class RouterCore {
    private routes: Map<string, React.ReactElement>;
    private currentPath: string;
    private listeners: Set<ListenerFunction>

    constructor() {
        this.routes = new Map()
        this.currentPath = window.location.pathname
        this.listeners = new Set<ListenerFunction>() 
        
        console.log('Router initialized with current path:', this.currentPath);
        window.addEventListener('popstate', this.handlePopState.bind(this));
    }

    addRoute(path: string, component: React.ReactElement){
        this.routes.set(path, component)
        console.log(`Route added: ${path}`);
    }

    navigate(path: string) {
        window.history.pushState({}, '', path);
        this.handlePopState();
      }
    
      handlePopState() {
        this.currentPath = window.location.pathname;
        console.log('Popstate event triggered. Current path updated to:', this.currentPath);
        this.notifyListeners();
      }
    
      subscribe (listener: ListenerFunction) {
        this.listeners.add(listener);
        console.log('Listener subscribed:', listener);
        return () => {this.listeners.delete(listener)
            console.log('Listener unsubscribed:', listener);

        };
      }
    
      notifyListeners() {
        console.log('Notifying listeners of current path:', this.currentPath);
        this.listeners.forEach(listener => listener(this.currentPath));
      }
    
      matchRoute() {
        const matchedComponent = this.routes.get(this.currentPath);
        console.log(`Matching route for current path (${this.currentPath}):`, matchedComponent);
        return matchedComponent;
      }


}