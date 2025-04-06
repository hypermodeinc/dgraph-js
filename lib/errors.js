Object.defineProperty(exports, '__esModule', { value: true })
exports.ERR_REFRESH_JWT_EMPTY =
  exports.ERR_READ_ONLY =
  exports.ERR_BEST_EFFORT_REQUIRED_READ_ONLY =
  exports.ERR_ABORTED =
  exports.ERR_FINISHED =
  exports.ERR_NO_CLIENTS =
    void 0
exports.ERR_NO_CLIENTS = new Error(
  'No clients provided in DgraphClient constructor',
)
exports.ERR_FINISHED = new Error(
  'Transaction has already been committed or discarded',
)
exports.ERR_ABORTED = new Error('Transaction has been aborted. Please retry')
exports.ERR_BEST_EFFORT_REQUIRED_READ_ONLY = new Error(
  'Best effort only works for read-only queries',
)
exports.ERR_READ_ONLY = new Error(
  'Readonly transaction cannot run mutations or be committed',
)
exports.ERR_REFRESH_JWT_EMPTY = new Error('refresh jwt should not be empty')
