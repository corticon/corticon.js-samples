This for demoing and testing basic async/await JavaScript operations within an SCO.

The SCO asynchronously gets some data (like a typical I/O operation would) and updates
the attribute message.

The sample contains 2 rulesheets.

The first one runs before the call to the SCO and asserts the value of the attribute message.
The second one runs after the SCO has completed and asserts the message attribute has been
updated correctly.
