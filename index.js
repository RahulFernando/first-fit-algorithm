const readline = require("readline");

/**
 * data property will hold size of the partition
 * next property hold the reference to next block
 * process_id property hold the allocated process id
 * isAllocated property indicate if process allocated or not
 */
class Node {
  constructor(data, next = null) {
    this.data = data;
    this.next = next;
    this.process_id = null;
    this.isAllocated = false;
  }
}

class MemoryManager {
  constructor(size) {
    // allocating 400K to OS
    this.head = new Node(size - 400);
  }

  allocate(process_id, process_size) {
    let current = this.head;

    while (current !== null) {
      // check block is free and block space enough to allocate
      if (!current.isAllocated && current.data >= process_size) {
        current.isAllocated = true;
        current.process_id = process_id;

        /**
         * if block size is more than what process need then split into two blocks
         * one for process
         * one for free space
         */
        if (current.data > process_size) {
          let new_node = new Node(current.data - process_size, current.next);
          current.data = process_size;
          current.next = new_node;
        }

        return;
      }
      current = current.next;
    }

    console.log(`No enough space to assign ${process_id}`);
  }

  terminate(process_id) {
    let current = this.head;

    while (current !== null) {
      /**
       * check given process assigned or not;
       * if it assigned remove process and free that space for other processes
       */
      if (current.process_id === process_id && current.isAllocated) {
        current.isAllocated = false;
        current.process_id = null;
        return;
      }
      current = current.next;
    }
    console.log(`${process_id} not found!`);
  }

  print() {
    let current = this.head;
    while (current !== null) {
      let status = current.isAllocated
        ? `${current.process_id} assigned`
        : "Free";
      console.log(`Size: ${current.data}k, Status: ${status}`);
      current = current.next;
    }
  }
}

// initialize instances
const manager = new MemoryManager(2560);
const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
let keepGoing = true;

const question = (prompt) =>
  new Promise((resolve) => reader.question(prompt, resolve));

// main program
const main = async () => {
  await question(
    "Welcome to Memory Management\nPlease enter any key to proceed..."
  );

  while (keepGoing) {
    const cmd = await question("1. Allocate\n2. Terminate\n3. Exit\nEnter: ");

    // Terminate main program if user choose exit
    if (Number(cmd) === 3) {
      await question("Have nice day!");
      keepGoing = false;
    }

    /**
     * Get process id and process size if user choose option 1
     * otherwise get process id to terminate
     */
    if (Number(cmd) === 1) {
      const answer = await question(
        "Enter comma separated process id and process_size: "
      );
      const [id, size] = answer.split(",");
      manager.allocate(id, Number(size));
      manager.print();
    } else {
      const answer = await question("Enter process id: ");
      manager.terminate(answer);
      manager.print();
    }
  }

  // close instance
  reader.close();
};

main();
