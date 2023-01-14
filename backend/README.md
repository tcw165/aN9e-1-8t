# Algorithm

First thing I want to bring up is that: For output, I purposely use integer instead of float/double because JSON is really bad for the floating number. JSON could lose some precision for floating numbers during the serialization and deserialization. And the fraction could also be a pain in the ass in other components in the entire system.

Structuring the problem using integers would eventually make the entire system more scalable.

Back to the algorithm, my algorithm has two major parts:
1. Allocate pro ratably as required.
2. Because I use integers, there might be some integral fragments left. We need to re-distribute the fragments to the investors as much as possible.

Overall, a couple rules are always satisfied for the output:
1. allocated amount <= requested amount for each investor.
2. Sum(allocated amounts) <= total allocation amount (the "allocation amount" in the question)

# Code

Well, it's Rails so architecture is pretty standard.

* [allocate_controller.rb](app/controllers/api/v1/allocate_controller.rb) offers POST `/api/v1/allocate` endpoint.
* [allocate_controller_test.rb](test/controllers/allocate_controller_test.rb) tests aginst `allocate_controller`.