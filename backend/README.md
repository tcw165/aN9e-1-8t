# Overall Architecture

Well, it's Rails so architecture is pretty standard.

* [allocate_controller.rb](app/controllers/api/v1/allocate_controller.rb) offers GET and POST `/api/v1/allocate` endpoint.
* [allocate_controller_test.rb](test/controllers/allocate_controller_test.rb) tests `allocate_controller`.