# zkApp: Account Updates

Each zkApp transaction constructed by o1js is composed of one or more `AccountUpdate` classes, which are a set of instructions for the Mina network to perform, such as altering on-chain state, emitting an event, and so on.

## Tutorial

For the step-by-step tutorial, see [Tutorial 10: Account Updates](https://docs.minaprotocol.com/zkapps/tutorials/account-updates).

## How to install and run this example project

1. Clone the repository:
    ```sh
    git clone https://github.com/o1-labs/docs2.git
    ```
2. Change directory to the project location:
    ```sh
    cd docs2/examples/zkapps/10-account-updates
    ```
3. Install dependencies:
    ```sh
    npm install
    ```

4. Build the project:
    ```sh
    npm run build
    ```

5. Run the compiled code:
    ```sh
    node build/src/main.js
    ```
    To run and build the compiled code with a single command:
    ```sh
    npm run build && node build/src/main.js
    ```

## Last audit date

**20-Februrary-2024**

## License

[Apache-2.0](LICENSE)
