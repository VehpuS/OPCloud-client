import { Injectable } from '@angular/core';
import { ModelObject } from '../../services/storage/model-object.class';
import { ModelStorageInterface } from '../../services/storage/model-storage.interface';
const joint = require('rappid');
const rootId="SD";
const firebaseKeyEncode = require('firebase-key-encode');


@Injectable()
export class GraphService {
  graph;
  graphLinks;
  currentGraphId;
  modelObject;
  modelStorage;
  private JSON;
  private JSON_string;
  private modelToSync;
  // private OPL;
  // private modelName;


  constructor(modelStorage: ModelStorageInterface) {
    this.modelStorage = modelStorage;
    this.graph = new joint.dia.Graph;
    this.JSON = this.graph.toJSON();
    localStorage.setItem(rootId, JSON.stringify(this.graph.toJSON()));
    this.currentGraphId = rootId;
    // this.initializeDatabase();
    // TODO: change:position emits on mousemove, find a better event - when drag stopped
    this.graph.on(`add 
                  remove 
                  change:position 
                  change:attrs 
                  change:size 
                  change:angle`,
      () => this.updateJSON());
     this.modelObject = new ModelObject(null, null);
  }

  getGraph(name?: string) {

    return name ? this.loadGraph(name) : this.graph;
  }

  saveGraph(modelName) {
    console.log('inside saveModel func')
    // TODO: work on this.graph.modelObject - might be JSON
    this.JSON = this.graph.toJSON();
    this.modelObject.saveModelParam(modelName, this.JSON);
    firebaseKeyEncode.deepEncode(this.modelObject.modelData);
    this.modelStorage.save(this.modelObject);
  }

  loadGraph(name) {
    this.modelStorage.get(name).then((res) => {
      this.modelObject = res;
      firebaseKeyEncode.deepDecode(this.modelObject.modelData)
      this.graph.fromJSON(this.modelObject.modelData);
    });
  }

  updateJSON() {
    if (this.modelObject.name !== null) {
       // update DB
      this.saveGraph(this.modelObject.name);
    }
    else {
      localStorage.setItem(this.modelObject.name, this.modelToSync);
    }
  }


//   this.fireDB.ref('/models/' + this.modelName).on('value', function (snapshot) {
//   getModel(snapshot.val());
// });

/*

   this.graph.listen = function () {
   function getModel(model) {
   if (this.graph.myChangeLock) {
   //console.log('my change');
   this.graph.myChangeLock = false;
   return;
   }
   this.graph.JSON_string = model.graph;
   this.graph.JSON = JSON.parse(this.graph.JSON_string);
   this.graph.fromJSON(JSON.parse(this.graph.JSON_string));
   this.graph.OPL = model.opl;
   document.getElementById("opl").innerHTML = this.graph.OPL;
   };
   if (this.modelName !== 'undefined') {
   this.fireDB.ref('/models/' + this.modelName).on('value', function (snapshot) {
   getModel(snapshot.val());
   });
   }
   };
   _.bind(this.graph.listen, this.graph);
   this.graph.listen();
   }
*/

  getGraphById(ElementId: string) {
    this.graph.fromJSON(JSON.parse(localStorage.getItem(ElementId)));
  }

  removeGraphById(ElementId: string,ParentId: string) {
     this.changeGraphModel(ParentId);
    localStorage.removeItem(ElementId);
  }

  graphSetUpdate(ElementId: string) {
    localStorage.setItem(this.currentGraphId, JSON.stringify(this.graph.toJSON()));
    var newGraph = new joint.dia.Graph;
    this.copyConntectedGraphElements(newGraph,ElementId);
    newGraph=newGraph.toJSON();
    localStorage.setItem(ElementId, JSON.stringify(newGraph));
    this.graph.fromJSON(newGraph);
    this.currentGraphId = ElementId;
  }

  //star

  private copyConntectedGraphElements(newGraph,elementId)
  {
    let gCell=this.graph.getCell(elementId);
    let connctedCells=this.graph.getNeighbors(gCell);
    newGraph.addCells(connctedCells);
    this.graphLinks = this.graph.getConnectedLinks(gCell);
  }

  changeGraphModel(elementId) {
    if (elementId == this.currentGraphId)
      return 0;
    localStorage.setItem(this.currentGraphId, JSON.stringify(this.graph.toJSON()));
    this.graph.fromJSON(JSON.parse(localStorage.getItem(elementId)));
    this.currentGraphId = elementId;
  }


}
