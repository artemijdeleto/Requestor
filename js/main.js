Prism.hooks.add('before-highlight', function (env) {
	env.code = env.element.innerText;
});

function printError(error) {
	document.getElementById('response').innerText = error.toString();
}

new Vue({
	el: '#app',
	data: {
		fields: [ {} ],
		method: '',
		endpoint: '',
		request: ''
	},
	created() {
		this.method = localStorage.getItem('latestMethod') || 'get';
		this.endpoint = localStorage.getItem('latestEndpoint') || 'https://jsonplaceholder.typicode.com/';
		this.request = localStorage.getItem('latestRequest') || 'users';
	},
	computed: {
		hasBody() {
			return ['post', 'put'].includes(this.method);
		}
	},
	methods: {
		send() {
			localStorage.setItem('latestMethod', this.method);
			localStorage.setItem('latestEndpoint', this.endpoint);
			localStorage.setItem('latestRequest', this.request);

			let data = new FormData();
			const headerElement = document.getElementById('headers');
			const responseElement = document.getElementById('response');

			if (this.hasBody) {
				const file = document.getElementById('file');
				const file_name = document.getElementById('file_name').value;

				if (file.files[0]) {
					data.append(file_name, file.files[0]);
				}

				this.fields.map((field) => {
					console.log(`Adding parameter ${field.name} with value ${field.value}`);
					data.append(field.name, field.value);
				});
			}

			fetch(this.endpoint + this.request, {
				mode: 'cors',
				body: this.hasBody ? data : null,
				method: this.method
			}).then(res => {
				let headers = {};
				for (header of res.headers.entries()) {
					headers[ header[0] ] = header[1];
				}
				headerElement.innerText = JSON.stringify(headers, null, '\t');
				Prism.highlightElement(headerElement);

				if (res.headers.get('content-type').indexOf('json') !== -1) {
					res.json().then(data => {
						responseElement.innerText = JSON.stringify(data, null, '\t');
						Prism.highlightElement(responseElement);
					}, err => {
						printError(`Content-Type header says it's JSON, but we can't read it`);
					});
				} else {
					res.text().then(data => {
						responseElement.innerText = data;
					})
				}
			}).catch(error => {
				printError(`Error happened. See console for details.\n${error}`);
				console.log(error);
			});
		}
	}
});