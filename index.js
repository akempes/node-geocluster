function geocluster(elements, bias, type){
	type = type || 'geodetic';
	if (!(this instanceof geocluster)) return new geocluster(elements, bias, type);
	return this._cluster(elements, bias, type);
};

// geodetic distance approximation
geocluster.prototype._dist = function(type, x1, y1, x2, y2, z1, z2) {
	if (type == 'geodetic') {
		return this._geodeticDist(x1, y1, x2, y2);
	} else if (type == 'linear') {
		return this._linearDist(x1, y1, x2, y2, z1, z2);
	}
}
	
geocluster.prototype._geodeticDist = function(x1, y1, x2, y2) {
	if (typeof(Number.prototype.toRad) === "undefined") {
	  Number.prototype.toRad = function() {
	    return this * Math.PI / 180;
	  }
	}
	
	var dx = (x2 - x1).toRad();
	var dy = (y2 - y1).toRad();
	var a = (Math.sin(dx/2) * Math.sin(dx/2) + Math.sin(dy/2) * Math.sin(dy/2) * Math.cos(x1.toRad()) * Math.cos(x2.toRad()));
	return (Math.round(((2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))) * 6371)*100)/100);
};

geocluster.prototype._linearDist = function(x1, y1, x2, y2, z1, z2) {
	var dx = (x2 - x1);
	var dy = (y2 - y1);
	var dz = ((z2 || 0) - (z1 || 0));

	return Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2))*100)/100;
};

geocluster.prototype._centroid = function(set) {
	var center = set.reduce(function(s, e){
		return {x: (s['x']+e['x']), y: (s['y']+e['y']), z: (s['z']+e['z']) };
	}, {x: 0, y: 0, z: 0});

	return {
		x: center['x'] / set.length,
		y: center['y'] / set.length,
		z: center['z'] / set.length,
	};
}

geocluster.prototype._clean = function(data) {
	return data.map(function(cluster){
		return {x: cluster.centroid['x'], y: cluster.elements['y'], z: cluster.elements['z']};
	});
};

geocluster.prototype._cluster = function(elements, bias, type) {
	
	var self = this;
	
	// set bias to 1 on default
	if ((typeof bias !== "number") || isNaN(bias)) bias = 1;
	
	var tot_diff = 0;
	var diffs = [];
	var diff;

	// calculate sum of differences
	for (i = 1; i < elements.length; i++) {
		diff = self._dist(type, elements[i]['x'], elements[i]['y'], elements[i-1]['x'], elements[i-1]['y'], elements[i]['z'], elements[i-1]['z']);
		tot_diff += diff;
		diffs.push(diff);
	}

	// calculate mean diff
	var mean_diff = (tot_diff / diffs.length);
	var diff_variance = 0;

	// calculate variance total
	diffs.forEach(function(diff){
		diff_variance += Math.pow(diff - mean_diff, 2);
	});
	
	// derive threshold from stdev and bias
	var diff_stdev = Math.sqrt(diff_variance / diffs.length);
	var threshold = (diff_stdev * bias);

	var cluster_map = [];
	
	// generate random initial cluster map
	var e = elements[Math.floor(Math.random() * elements.length)];
	cluster_map.push({
		centroid: {x: e['x'], y: e['y'], z: e['z']},
		elements: []
	});

	// loop elements and distribute them to clusters
	var changing = true;
	while (changing === true) {

		var new_cluster = false;
		var cluster_changed = false;
		
		// iterate over elements
		elements.forEach(function(e, ei){

			var closest_dist = Infinity;
			var closest_cluster = null;
			
			// find closest cluster
			cluster_map.forEach(function(cluster, ci){
				
				// distance to cluster
				
				dist = self._dist(type, e['x'], e['y'], cluster_map[ci].centroid['x'], cluster_map[ci].centroid['y'], e['z'], cluster_map[ci].centroid['z']);
				if (dist < closest_dist) {
					closest_dist = dist;
					closest_cluster = ci;
				}
				
			});
			
			// is the closest distance smaller than the stddev of elements?
			if (closest_dist < threshold || closest_dist === 0) {

				// put element into existing cluster
				cluster_map[closest_cluster].elements.push(e);

			} else {
			
				// create a new cluster with this element
				cluster_map.push({
					centroid: {x: e['x'], y: e['y'], z: e['z']},
					elements: [e]
				});

				new_cluster = true;
				
			}
		
		});

		// delete empty clusters from cluster_map 
		cluster_map = cluster_map.filter(function(cluster){
			return (cluster.elements.length > 0);
		});
		
		// calculate the clusters centroids and check for change
		cluster_map.forEach(function(cluster, ci){
			var centroid = self._centroid(cluster.elements);
			if (centroid['x'] !== cluster.centroid['x'] || centroid['y'] !== cluster.centroid['y'] || centroid['z'] !== cluster.centroid['z']) {
				cluster_map[ci].centroid = centroid;
				cluster_changed = true;
			}
		});
		
		// loop cycle if clusters have changed
		if (!cluster_changed && !new_cluster) {
			changing = false;
		} else {
			// remove all elements from clusters and run again
			if (changing) cluster_map = cluster_map.map(function(cluster){
				cluster.elements = [];
				return cluster;
			});
		}
		
	}

	// compress result
	return cluster_map;

};

module.exports = geocluster;
