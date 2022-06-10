import { Component, OnInit } from '@angular/core';
import ForceGraph from 'force-graph';

export interface dataGraphFormat {
  nodes: graphNode[],
  links: graphLink[]
};

export interface graphNode {
  id: string,
  name: string,
  val: number,
  label: string
};

export interface graphLink {
  source: string,
  target: string
};

@Component({
  selector: 'app-implementation',
  templateUrl: './implementation.component.html',
  styleUrls: ['./implementation.component.css']
})
export class ImplementationComponent implements OnInit {

  nodesQty: number;
  error: string = null;
  nodes = new Array<Array<Number>>();
  nodesData = new Array<Array<Number>>();
  start: Number;
  end: Number;
  flujoMax: Number;
  all_parents = new Array<Array<Number>>();
  path_flows = new Array<Number>();
  rGraph = new Array<Array<Number>>();
  nodesGraph = new Array<graphNode>();
  links = new Array<graphLink>();

  constructor() { }

  public ngOnInit(): void { }

  validateInput() {
    if (this.nodesQty < 2 || this.nodesQty > 10) {
      this.error = "La cantidad de nodos " + this.nodesQty + " no es permitida";
      return;
    }

    if (this.start > this.end || this.start < 0) {
      this.error = "El nodo inicial tiene que ser mayor que cero y menor que el nodo final.";
      return;
    }

    this.error = null;

    if (this.nodes.length > 0) {
      this.nodes = [];
    }

    for (let i = 0; i < this.nodesQty; i++) {
      const node: graphNode = {
        id: String(i),
        name: String(i),
        val: 1,
        label: String(i)
      };
      this.nodesGraph.push(node);
    }
    console.log(this.nodesGraph);

    for (let i = 0; i <= this.nodesQty - 1; i++) {
      let row: Number[] = new Array<Number>();
      for (let j = 0; j <= this.nodesQty - 1; j++) {
        row.push(0);
      }
      this.nodes.push(row);
    }

    this.nodesData = JSON.parse(JSON.stringify(this.nodes));
  }

  changeValue(newValue, i, j) {
    this.nodesData[i][j] = Number(newValue);
  }

  seeGraph() {
    let graph = document.getElementById("graph");
    const myGraph = ForceGraph();
    let dataGraph: dataGraphFormat = {
      links: [],
      nodes: []
    };

    // Fill nodes
    this.nodesGraph.forEach(node => {
      dataGraph.nodes.push(node);
    });

    // Fill links
    this.rGraph.forEach((nodes, i) => {
      nodes.forEach((node, j) => {
        if (node !== 0) {
          const link = {
            source: String(i),
            target: String(j)
          };
          this.links.push(link);
        }
      });
    });

    this.links.forEach(link => {
      dataGraph.links.push(link);
    });

    myGraph(graph)
      .graphData(dataGraph)
      .width(350)
      .height(350)
      .linkLabel((link: any): string => {
        return (link.source.id.toString() + ' -- ' + link.target.id.toString())
      });
  }

  apply() {
    // Javascript program for implementation of Ford
    // Fulkerson algorithm

    // Number of vertices in graph
    let V = this.nodesQty;

    // Returns true if there is a path from source
    // 's' to sink 't' in residual graph. Also
    // fills parent[] to store the path
    function bfs(rGraph, s, t, parent) {

      // Create a visited array and mark all
      // vertices as not visited
      let visited = new Array(V);
      for (let i = 0; i < V; ++i)
        visited[i] = false;

      // Create a queue, enqueue source vertex
      // and mark source vertex as visited
      let queue = [];
      queue.push(s);
      visited[s] = true;
      parent[s] = -1;

      // Standard BFS Loop
      while (queue.length != 0) {
        let u = queue.shift();

        for (let v = 0; v < V; v++) {
          if (visited[v] == false &&
            rGraph[u][v] > 0) {

            // If we find a connection to the sink
            // node, then there is no point in BFS
            // anymore We just have to set its parent
            // and can return true
            if (v == t) {
              parent[v] = u;
              return true;
            }
            queue.push(v);
            parent[v] = u;
            visited[v] = true;
          }
        }
      }

      // We didn't reach sink in BFS starting
      // from source, so return false
      return false;
    }

    // Returns tne maximum flow from s to t in
    // the given graph
    function fordFulkerson(graph, s, t) {
      let u, v;

      // Create a residual graph and fill the
      // residual graph with given capacities
      // in the original graph as residual
      // capacities in residual graph

      // Residual graph where rGraph[i][j]
      // indicates residual capacity of edge
      // from i to j (if there is an edge.
      // If rGraph[i][j] is 0, then there is
      // not)
      let rGraph = new Array(V);

      for (u = 0; u < V; u++) {
        rGraph[u] = new Array(V);
        for (v = 0; v < V; v++)
          rGraph[u][v] = graph[u][v];
      }

      // This array is filled by BFS and to store path
      let parent = new Array(V);

      // To store paths along the iterations
      let all_parents = new Array<Array<Number>>();

      // There is no flow initially
      let max_flow = 0;

      // To store flow quantities in each iteration 
      let path_flows = new Array<Number>();

      // Augment the flow while tere
      // is path from source to sink
      while (bfs(rGraph, s, t, parent)) {

        // Store path in array
        all_parents.push(parent);

        // Find minimum residual capacity of the edhes
        // along the path filled by BFS. Or we can say
        // find the maximum flow through the path found.
        let path_flow = Number.MAX_VALUE;
        for (v = t; v != s; v = parent[v]) {
          u = parent[v];
          path_flow = Math.min(path_flow,
            rGraph[u][v]);
        }

        // Update residual capacities of the edges and
        // reverse edges along the path
        for (v = t; v != s; v = parent[v]) {
          u = parent[v];
          rGraph[u][v] -= path_flow;
          rGraph[v][u] += path_flow;
        }

        // Store path flow in array
        path_flows.push(path_flow);

        // Add path flow to overall flow
        max_flow += path_flow;
      }

      console.log('Sumatoria: ', path_flows);

      console.log('Residual: ', rGraph);

      // Return the overall flow
      return { max_flow, path_flows, all_parents, rGraph };
    }
    
    let result = fordFulkerson(this.nodesData, this.start, this.end);
    this.flujoMax = result.max_flow;
    this.all_parents = result.all_parents;
    this.path_flows = result.path_flows;
    console.log(result.rGraph);
    this.rGraph = result.rGraph;
  }

}
