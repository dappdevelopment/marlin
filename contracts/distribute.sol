contract Storage { 
function distribute(byte) { 
	byte[1024] data; //creates a byte of data, to be distributed to a node of choice
	for (uint i = 0; i < 1024; i++) { 
			data[i] = /*filepath(byte).bytestream.next*/;
		}
	distributeToOptimalNode(data);
	}
	function collect(string filepath) {
		for (byte : filepath) {
			distribute(byte)
		}
	}
}