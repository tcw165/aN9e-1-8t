class Api::V1::AllocateController < ApplicationController

  def show
    allocation_amount = allocate_params.fetch(:allocation_amount)
    investors = allocate_params.fetch(:investor_amounts)

    # Sum the average amounts.
    # time complexity: O(n) where n is # of investors.
    total_avg_amounts = 0
    investors.each do |inv|
      # Avoid 0 or negative amount
      inv[:requested_amount] = [0, inv[:requested_amount]].max
      
      requested_amount, average_amount = inv.values_at(:requested_amount, :average_amount)

      # Only count the valid requests
      if requested_amount > 0
        total_avg_amounts += average_amount
      end
    end
    
    # Use the investor's historical data for the prorational allocation.
    # time complexity: O(n) where n is # of investors.
    allocation = {}
    actual_allocation_amount = 0
    investors.each do |investor|
      name, requested_amount, average_amount = investor.values_at(:name, :requested_amount, :average_amount)
      
      # Take "floor" value in case the total calculated allocation overflows the given allocation number
      prorated_amount = (allocation_amount * (average_amount.to_f / total_avg_amounts)).floor
      capped_amount = [requested_amount, prorated_amount].min
      
      allocation[name] = capped_amount # Fun fact, this map[] = value is very buggy code in C++.

      # Due to use of "floor" and respective cap, there may be some fragments left over and we want to exhaust that.
      actual_allocation_amount += capped_amount
    end

    # Distribute the remaining funds
    # O(nlog(n)) time complexity where n is # of investors.
    allocation_remains = allocation_amount - actual_allocation_amount
    if allocation_remains > 0
      # Sort investors in descending order.
      # e.g Investor A ($100), Investor B ($75), Investor C ($25) ...etc
      sorted_investors = investors.sort { |a, b| b[:requested_amount] <=> a[:requested_amount] }
      
      sorted_investors.each do |investor|
        break if allocation_remains == 0

        name, requested_amount = investor.values_at(:name, :requested_amount)
        used_amount = allocation[name]

        redistributed_amount = [requested_amount - used_amount, allocation_remains].min
        if redistributed_amount > 0
          allocation_remains -= redistributed_amount
          allocation[name] = used_amount + redistributed_amount
        end
      end
    end

    puts "response #{allocation}"

    render(json: allocation)
  end

  private
  
  def allocate_params
    # Test command:
    # curl -X POST http://localhost/api/v1/allocate -H 'Content-Type: application/json' -d '{"allocation_amount":100,"investor_amounts":[{"name":"Investor A","requested_amount":100,"average_amount":100},{"name":"Investor B","requested_amount":25,"average_amount":25}]}'

    params.require(:allocate)
          .permit(:allocation_amount, 
                  investor_amounts: [:name, :requested_amount, :average_amount])
  end

end
