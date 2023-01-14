Rails.application.routes.draw do
  namespace(:api) do
    namespace(:v1) do
      match('/allocate', to: 'allocate#show', via: [:post])
    end
  end
end
