import child_process from 'child_process'

const child = child_process.spawn('python', ['-u']);

child.stdin.setEncoding('utf-8');
child.stdout.setEncoding('utf-8');
child.stderr.setEncoding('utf-8');

// child.stdout.pipe(process.stdout);
child.stdout.on('data', data => console.log(data))
child.stderr.on('data', data => console.log(data))

child.stdin.write("ls\n");
child.stdin.write("\n")

child.stdin.end(); 

// child.stdin.write("print('hi')\n");

// child.stdin.end(); 