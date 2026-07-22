const expectedSet = "rs-test";
const expectedHost = "localhost:27018";

try {
  rs.status();
} catch (error) {
  if (error.codeName !== "NotYetInitialized") {
    throw error;
  }
  rs.initiate({
    _id: expectedSet,
    members: [{ _id: 0, host: expectedHost }],
  });
}

const deadline = Date.now() + 60000;
while (Date.now() < deadline) {
  const hello = db.hello();
  if (hello.setName === expectedSet && hello.isWritablePrimary === true) {
    print("Replica set rs-test is writable");
    quit(0);
  }
  sleep(500);
}

throw new Error("Replica set rs-test did not become writable within 60 seconds");
