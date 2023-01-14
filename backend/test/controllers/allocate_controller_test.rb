require "test_helper"

class AllocateControllerTest < ActionDispatch::IntegrationTest

  @@URL = '/api/v1/allocate'

  # called after every single test
  teardown do
    # when controller is using cache it may be a good idea to reset it afterwards
    Rails.cache.clear
  end

  test "happy case (no fraction)" do
    post(@@URL, params: {
      allocation_amount: 100,
      investor_amounts: [
        {
          name: "Investor A",
          requested_amount: 100,
          average_amount: 100
        },
        {
          name: "Investor B",
          requested_amount: 25,
          average_amount: 25
        }
      ]
    }, as: :json)

    json_response = JSON.parse(@response.body)
    
    assert_response(:success)
    
    assert_equal(80, json_response['Investor A'])
    assert_equal(20, json_response['Investor B'])

    # Sum must equal to 100
    assert(100 == json_response.inject(0) { |sum, pair| sum += pair.last })
  end

  test "case that has fractional ratio" do
    post(@@URL, params: {
      allocation_amount: 100,
      investor_amounts: [
        {
          name: "Investor A",
          requested_amount: 100,
          average_amount: 70
        },
        {
          name: "Investor B",
          requested_amount: 25,
          average_amount: 30
        }
      ]
    }, as: :json)
    
    json_response = JSON.parse(@response.body)

    assert_response(:success)
    
    # Allocation to investor A must be 2x times greater than investor B's
    assert(json_response['Investor A'] > 2 * json_response['Investor B'])

    # Sum must equal to 100
    assert(100 == json_response.inject(0) { |sum, pair| sum += pair.last })
  end

  test "investor a asks smaller than investor b, where a has larger investment in the history" do
    post(@@URL, params: {
      allocation_amount: 100,
      investor_amounts: [
        {
          name: "Investor A",
          requested_amount: 10,
          average_amount: 1000
        },
        {
          name: "Investor B",
          requested_amount: 25,
          average_amount: 100
        }
      ]
    }, as: :json)
    
    json_response = JSON.parse(@response.body)

    assert_response(:success)
    
    assert_equal(10, json_response['Investor A'])
    assert_equal(25, json_response['Investor B'])
    assert(35 == json_response.inject(0) { |sum, pair| sum += pair.last })
  end

  test "some investors ask for 0 or negative investment!?" do
    post(@@URL, params: {
      allocation_amount: 100,
      investor_amounts: [
        {
          name: "Investor A",
          requested_amount: -1000, # This investor must be insane, huh!?
          average_amount: 1000
        },
        {
          name: "Investor B",
          requested_amount: 100,
          average_amount: 100
        },
        {
          name: "Investor C",
          requested_amount: 100,
          average_amount: 100
        }
      ]
    }, as: :json)
    
    json_response = JSON.parse(@response.body)

    assert_response(:success)
    
    assert_equal(0, json_response['Investor A'])
    assert_equal(50, json_response['Investor B'])
    assert_equal(50, json_response['Investor C'])
    assert(100 == json_response.inject(0) { |sum, pair| sum += pair.last })
  end

end
