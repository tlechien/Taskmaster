

const fs = require("fs");
const { Snippet, Input } = require('enquirer');



let file_creation = () => {
	let get_filename = new Input({
		message: 'What name do you wish for your new configuration?',
		initial: 'newConfig',
		validate: (value) => {
			if (!value || !value.trim().length)
				return get_filename.styles.danger("Invalid command length.");
			try {
				fs.accessSync("./configurations/" + value.substr(0, ~value.indexOf(".tm.json") || value.length) + ".tm.json");
				return get_filename.styles.danger("Already exists.");
			} catch (err) {
				console.error(`Cannot access the configuration file (${value})`.);
				return true
			}
		}
	});

	let question = new Snippet({
		message: 'Fill out the fields in your new program config',
		required: true,
		fields: [
			{
				name: 'command',
				message: '/bin/ls -la',
				validate: (value) => {
					if (!value || !value.trim().length) return question.styles.danger("Invalid command length.");
					else return true
				}
			},
			{
				name: 'count',
				message: '2',
				validate: (value, state, item, index, non, lol) => {
					if (!isNaN(+value) && +value > 0) return true;
					else return question.styles.danger("Must be a positive number.");
				}
			},
			{
				name: 'execAtLaunch',
				message: 'true',
				validate: (value, state, item, index) => {
					// console.log(value, typeof(value))
					try {
						if (value.length && typeof eval(value) == "boolean") return true
						else return question.styles.danger("Must be a boolean.");
					} catch (e) {
						return question.styles.danger("Must be a boolean.")
					}
				}
			},
			{
				name: 'restart',
				message: 'always | never | SIGXXX,SIGXXX,...',
				validate: (value, state, item, index) => {
					let signals = Object.keys(require("os").constants.signals);
					if (!value || !value.trim().length)
						return question.styles.danger("Must be equal to a valid signal, 'always', or 'never'.")
					value = value.trim().split(",")
					let bool = false;
					if (value.length == 1)
						bool = !!~["always", "never", ...signals].indexOf(value[0]);
					else
						bool = value.reduce((acu, elem, array) => acu && !!~signals.indexOf(elem), true);
					if (bool) return true
					else return question.styles.danger("Must be equal to a valid signal, 'always', or 'never'.")
					if (!value || !value.trim().length || !~["always", "never", ...signals, ...signals.map(x => "SIG" + x)].indexOf(value))
						return question.styles.danger("Must be equal to a valid signal, 'always', or 'never'.")
					else return true;
				}
			},
			{
				name: 'expectedOutput',
				message: '0,-1,1',
				validate: (value, state, item, index) => {
					if (!value || !value.trim().length)
						return question.styles.danger("Must be equal to a valids numbers.")
					value = value.trim().split(",")
					let bool = false;
					if (value.reduce((acu, elem) => acu && +elem < Infinity, true))
						return true;
					else return question.styles.danger("Must be equal to a valids numbers.");
				}
			},
			{
				name: 'successTime',
				message: '400',
				validate: (value, state, item, index, non, lol) => {
					if (+value != NaN && +value > 0) return true;
					else return question.styles.danger("Must be a positive number.");
				}
			}, {
				name: 'retryCount',
				type: "number",
				message: '3',
				validate: (value, state, item, index, non, lol) => {
					if (+value != NaN && +value > 0) return true;
					else return question.styles.danger("Must be a positive number.");
				}
			}, {
				name: 'killSignal',
				message: 'SIGTERM',
				validate: (value, state, item, index) => {
					let signals = Object.keys(require("os").constants.signals)
					if (!value || !value.trim().length)
						return question.styles.danger("Must be equal to a valid signal.");
					if (~signals.indexOf(value)) return true;
					else return question.styles.danger("Must be equal to a valid signal.");
				}
			}, {
				name: 'terminationTime',
				message: '100',
				validate: (value, state, item, index, non, lol) => {
					if (+value != NaN && +value > 0) return true;
					else return question.styles.danger("Must be a positive number.");
				}
			}, {
				name: 'err',
				message: 'true',
				validate: (value, state, item, index) => {
					// console.log(value, typeof(value))
					try {
						if (value.length && typeof eval(value) == "boolean") return true
						else return question.styles.danger("Must be a boolean.");
					} catch (e) {
						return question.styles.danger("Must be a boolean.")
					}
				}
			}, {
				name: 'out',
				message: 'true',
				validate: (value, state, item, index) => {
					// console.log(value, typeof(value))
					try {
						if (value.length && typeof eval(value) == "boolean") return true
						else return question.styles.danger("Must be a boolean.");
					} catch (e) {
						return question.styles.danger("Must be a boolean.")
					}
				}
			}, {
				name: 'custom_err',
				message: '/logs/program.err',
			}, {
				name: 'custom_out',
				message: '/logs/program.out',
			}, {
				name: 'workingDirectory',
				message: '/Users/user',
				validate: (value) => {
					if (!value || !value.trim().length) return question.styles.danger("Invalid length");
					else {
						if (fs.existsSync(value)) return true
						else return question.styles.danger("Must be a valid and accessible path.")
					}
				}
			}, {
				name: 'umask',
				message: '100',
				validate: (value, state, item, index, non, lol) => {
					if (+value != NaN && +value > 0 && +value <= 0xFFF) return true;
					else return question.styles.danger("Must be a positive number.");
				}
			}, {
				name: 'env',
				message: 'key:value,key2:value2'
			}
		],
		template: `{
    "command": "\${command}",
    "count": \${count},
    "execAtLaunch": \${execAtLaunch},
    "restart": "\${restart}",
    "expectedOutput": [\${expectedOutput}],
    "successTime": \${successTime},
    "retryCount": \${retryCount},
    "killSignal": "\${killSignal}",
    "terminationTime": \${terminationTime},
    "err": \${err},
    "out": \${out},
    "custom_err": "\${custom_err}",
    "custom_out": "\${custom_out}",
    "workingDirectory": "\${workingDirectory}",
    "umask": \${umask},
    "env": "\${env}"
 }`
	});
	//global.read.close();
	get_filename.run().then(answers => {
		let name = answers.substr(0, ~answers.indexOf(".tm.json") || answers.length);
		question.run().then(answer => {
			read = null;
			setupRead();
			try {
				fs.writeFileSync("./configurations/" + name + ".tm.json", answer.result, "utf-8");
				ctl.isQuestion = false;
				return true
			} catch (err) {
				console.error(`Failed to write the configuration file (${value})`.);
				return false
			}
		}).catch(x=> {
			//console.error("question catch", x);
			setupRead();
			return false;
		});
	}).catch(x=> {
		//console.log("ok mek c close getfilename");
		setupRead();
		return false;
	});
};
module.exports = {file_creation};
