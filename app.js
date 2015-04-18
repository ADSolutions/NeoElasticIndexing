var es = require("elasticsearch")
var neo4j = require('neo4j')

var graph = new neo4j.GraphDatabase('http://localhost:7474');
var client = new es.Client;

var _indexName = "xx"
var _indexType = "yy"

if (_indexName.length == 0 || _indexType == 0) 
{
	console.log("Insert valid index name and index type")
	return;
}

function indexing(offset,limit) {

	graph.cypher({
	    query: 'MATCH (el:'+_indexType+') RETURN el SKIP {offset} LIMIT {limit}',
	    params: {
	        offset:offset,
	        limit:limit
	    }
	}, function (err, results) {
	    if (err)
	    {
	    	console.log(err)
		}
		else
		{
			for(var i=0;i<results.length;i++) {

				var _el = results[i].el

				var _indexing = {}
				_indexing = _el.properties
				_indexing["_id"] = _el["_id"]

				createElasticsearch(_indexing,function(e,r) {
					// if (!e) 
					// 	console.log("OK"," ",r)
					// else
					// 	console.log("KO "+e)
				})
			}

			if (results.length < 20) 
				return;
			
			indexing(offset+20,limit)
		}
	});
}

function createElasticsearch(doc,completionHandler) {
	client.create({
		index:_indexName,
		type:_indexType,
		id:doc["_id"],
		body:doc
	}, completionHandler)
}

indexing(0,20)

